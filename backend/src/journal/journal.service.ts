import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NumberingService, NumberPrefix } from '../numbering/numbering.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { CreateJournalLineDto } from './dto/create-journal-line.dto';
import { FindJournalQueryDto } from './dto/find-journal-query.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';

/** List rows need the related names and a line count (not the full lines). */
const withListMeta = {
  business: { select: { id: true, name: true } },
  bank: { select: { id: true, bank: true } },
  journalCategory: { select: { id: true, name: true } },
  _count: { select: { lines: true } },
} satisfies Prisma.JournalInclude;

/** Detail rows include every line (scalar FKs prefill the edit form). */
const withDetail = {
  business: { select: { id: true, name: true } },
  bank: { select: { id: true, bank: true } },
  journalCategory: { select: { id: true, name: true } },
  lines: { orderBy: { id: 'asc' } },
} satisfies Prisma.JournalInclude;

/** Round a money value to 2 decimal places. */
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

@Injectable()
export class JournalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numbering: NumberingService,
  ) {}

  /**
   * Recompute the derived header `total_value` (sum of the line values). The
   * client-sent total is never trusted — it is always recomputed here.
   */
  private computeTotal(lines: CreateJournalLineDto[]): number {
    return round2(lines.reduce((sum, line) => sum + Number(line.value), 0));
  }

  /**
   * Signed impact a journal's lines have on its bank balance: Income (type 1)
   * adds, Expenses (type 2) subtracts. Used to keep `bank.balance` in sync when
   * a journal is created, edited or removed.
   */
  private netEffect(
    lines: { type: number; value: Prisma.Decimal | number }[],
  ): number {
    return round2(
      lines.reduce(
        (sum, line) =>
          sum + (line.type === 1 ? Number(line.value) : -Number(line.value)),
        0,
      ),
    );
  }

  /** Normalise a line for Prisma (coerce optional FKs to null). */
  private toLineData(line: CreateJournalLineDto) {
    return {
      accountId: line.accountId,
      type: line.type,
      description: line.description ?? null,
      reference: line.reference ?? null,
      assetId: line.assetId ?? null,
      empId: line.empId ?? null,
      supplierId: line.supplierId ?? null,
      value: line.value,
    };
  }

  async create(createJournalDto: CreateJournalDto) {
    // status is dropped: a freshly saved entry is always posted (Finish).
    // journalNo is dropped too: it is generated server-side on save.
    const { date, lines, status: _status, journalNo: _journalNo, ...header } =
      createJournalDto;
    void _status;
    void _journalNo;
    try {
      return await this.prisma.$transaction(async (tx) => {
        const journalNo = await this.numbering.next(tx, NumberPrefix.Journal);
        const journal = await tx.journal.create({
          data: {
            ...header,
            journalNo,
            date: new Date(date),
            totalValue: this.computeTotal(lines),
            // Business rule: saving a new entry sets status to 2 (Finish) and
            // stamps the post time server-side.
            status: 2,
            postTime: new Date(),
            lines: { create: lines.map((line) => this.toLineData(line)) },
          },
          include: withDetail,
        });
        // A posted (Finish) journal moves money: Income adds to the bank
        // balance, Expenses subtract from it.
        const effect = this.netEffect(lines);
        if (effect !== 0) {
          await tx.bank.update({
            where: { id: header.bankId },
            data: { balance: { increment: effect } },
          });
        }
        return journal;
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindJournalQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.JournalWhereInput = {
      ...(search && {
        journalNo: { contains: search, mode: 'insensitive' },
      }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.journal.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withListMeta,
      }),
      this.prisma.journal.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const journal = await this.prisma.journal.findUnique({
      where: { id },
      include: withDetail,
    });
    if (!journal) {
      throw new NotFoundException('Journal not found');
    }
    return journal;
  }

  async update(id: number, updateJournalDto: UpdateJournalDto) {
    const existing = await this.findOne(id);
    const { date, lines, ...header } = updateJournalDto;

    // Balance impact this journal currently has on its bank (only Finish
    // journals post), versus the impact it will have after this edit. The bank,
    // the lines and the status can all change, so compute both ends explicitly.
    const oldBankId = existing.bankId;
    const oldEffect =
      existing.status === 2 ? this.netEffect(existing.lines) : 0;

    const newBankId = header.bankId ?? existing.bankId;
    const newStatus = header.status ?? existing.status;
    const newLines = lines ?? existing.lines;
    const newEffect = newStatus === 2 ? this.netEffect(newLines) : 0;

    try {
      // Lines are fully replaced: drop the old set, then recreate from the
      // incoming payload — all inside one transaction so it is atomic.
      return await this.prisma.$transaction(async (tx) => {
        if (lines !== undefined) {
          await tx.journalLine.deleteMany({ where: { mainId: id } });
        }
        const journal = await tx.journal.update({
          where: { id },
          data: {
            ...header,
            ...(date !== undefined && { date: new Date(date) }),
            ...(lines !== undefined && {
              totalValue: this.computeTotal(lines),
              lines: { create: lines.map((line) => this.toLineData(line)) },
            }),
          },
          include: withDetail,
        });
        // Reverse the old balance impact and apply the new one. When the bank is
        // unchanged this collapses to a single net adjustment.
        if (oldBankId === newBankId) {
          const delta = round2(newEffect - oldEffect);
          if (delta !== 0) {
            await tx.bank.update({
              where: { id: newBankId },
              data: { balance: { increment: delta } },
            });
          }
        } else {
          if (oldEffect !== 0) {
            await tx.bank.update({
              where: { id: oldBankId },
              data: { balance: { increment: -oldEffect } },
            });
          }
          if (newEffect !== 0) {
            await tx.bank.update({
              where: { id: newBankId },
              data: { balance: { increment: newEffect } },
            });
          }
        }
        return journal;
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    const effect = existing.status === 2 ? this.netEffect(existing.lines) : 0;
    return this.prisma.$transaction(async (tx) => {
      // Child lines are removed automatically via onDelete: Cascade.
      const deleted = await tx.journal.delete({ where: { id } });
      // Undo the balance impact the journal had while it was posted.
      if (effect !== 0) {
        await tx.bank.update({
          where: { id: existing.bankId },
          data: { balance: { increment: -effect } },
        });
      }
      return deleted;
    });
  }

  private handleError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new ConflictException('Journal already exists');
      }
      // Foreign key violation (unknown business/bank/category/account/...).
      if (error.code === 'P2003') {
        return new BadRequestException(
          'Invalid business, bank, category, account or related reference',
        );
      }
    }
    return error;
  }
}
