import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * One flattened cash-flow row. Names are pre-joined and amounts are plain
 * numbers so the row drops straight into the WebDataRocks pivot with no further
 * shaping on the client. Direction is carried by `type`, never by the sign of
 * `amount`.
 */
export interface CashFlowReportRow {
  source: 'Journal' | 'Cash Transfer' | 'Recurring (projected)';
  date: string; // ISO "YYYY-MM-DD"
  business: string;
  bank: string;
  account: string;
  category: string;
  type: 'Income' | 'Expense';
  amount: number;
}

/** Format a Date as a local "YYYY-MM-DD" string (no timezone shift). */
function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Income lines (type 1) are inflows; everything else is an outflow. */
function lineType(type: number): 'Income' | 'Expense' {
  return type === 1 ? 'Income' : 'Expense';
}

const lineInclude = {
  account: { include: { group: { select: { name: true } } } },
} satisfies Prisma.JournalLineInclude & Prisma.RecurringLineInclude;

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Build the consolidated cash-flow dataset from three sources:
   *  - posted Journals (status 2) — actual movements, one row per line
   *  - finished Cash Transfers (status 2) — two rows each (out of `from`,
   *    into `to`) so per-bank views are correct and the total nets to zero
   *  - active Recurring templates (status 1) — projected across the current
   *    year within their `[fromPeriod, toPeriod]` window
   */
  async cashFlow(): Promise<CashFlowReportRow[]> {
    const [journals, transfers, recurrings] = await Promise.all([
      this.prisma.journal.findMany({
        where: { status: 2 },
        include: {
          business: { select: { name: true } },
          bank: { select: { bank: true } },
          lines: { include: lineInclude },
        },
      }),
      this.prisma.cashTransfer.findMany({
        where: { status: 2 },
        include: {
          fromBankRef: {
            select: { bank: true, business: { select: { name: true } } },
          },
          toBankRef: {
            select: { bank: true, business: { select: { name: true } } },
          },
        },
      }),
      this.prisma.recurring.findMany({
        where: { status: 1 },
        include: {
          business: { select: { name: true } },
          bank: { select: { bank: true } },
          lines: { include: lineInclude },
        },
      }),
    ]);

    const rows: CashFlowReportRow[] = [];

    // --- Journals: one row per line --------------------------------------
    for (const journal of journals) {
      const date = toIsoDate(journal.date);
      for (const line of journal.lines) {
        rows.push({
          source: 'Journal',
          date,
          business: journal.business.name,
          bank: journal.bank.bank,
          account: line.account.name,
          category: line.account.group.name,
          type: lineType(line.type),
          amount: Number(line.value),
        });
      }
    }

    // --- Cash transfers: outflow from `from`, inflow to `to` --------------
    for (const transfer of transfers) {
      const date = toIsoDate(transfer.date);
      const amount = Number(transfer.value);
      rows.push({
        source: 'Cash Transfer',
        date,
        business: transfer.fromBankRef.business.name,
        bank: transfer.fromBankRef.bank,
        account: 'Cash Transfer',
        category: 'Cash Transfer',
        type: 'Expense',
        amount,
      });
      rows.push({
        source: 'Cash Transfer',
        date,
        business: transfer.toBankRef.business.name,
        bank: transfer.toBankRef.bank,
        account: 'Cash Transfer',
        category: 'Cash Transfer',
        type: 'Income',
        amount,
      });
    }

    // --- Recurring: project across the current calendar year -------------
    rows.push(...this.projectRecurrings(recurrings));

    return rows;
  }

  /**
   * Projection horizon for recurring templates: the current calendar year.
   * Widen this (e.g. to a configurable range) if a longer forecast is needed.
   */
  private projectRecurrings(
    recurrings: Array<{
      recurringDay: number;
      fromPeriod: Date | null;
      toPeriod: Date | null;
      business: { name: string };
      bank: { bank: string };
      lines: Array<{
        type: number;
        value: Prisma.Decimal;
        account: { name: string; group: { name: string } };
      }>;
    }>,
  ): CashFlowReportRow[] {
    const rows: CashFlowReportRow[] = [];
    const year = new Date().getFullYear();

    for (const recurring of recurrings) {
      for (let month = 0; month < 12; month++) {
        // Clamp the recurring day to the month's last day (e.g. 31 -> 30/28).
        const lastDay = new Date(year, month + 1, 0).getDate();
        const day = Math.min(recurring.recurringDay, lastDay);
        const date = new Date(year, month, day);

        if (recurring.fromPeriod && date < recurring.fromPeriod) continue;
        if (recurring.toPeriod && date > recurring.toPeriod) continue;

        const isoDate = toIsoDate(date);
        for (const line of recurring.lines) {
          rows.push({
            source: 'Recurring (projected)',
            date: isoDate,
            business: recurring.business.name,
            bank: recurring.bank.bank,
            account: line.account.name,
            category: line.account.group.name,
            type: lineType(line.type),
            amount: Number(line.value),
          });
        }
      }
    }

    return rows;
  }
}
