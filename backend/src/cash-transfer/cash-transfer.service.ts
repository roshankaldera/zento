import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NumberingService, NumberPrefix } from '../numbering/numbering.service';
import { CreateCashTransferDto } from './dto/create-cash-transfer.dto';
import { FindCashTransferQueryDto } from './dto/find-cash-transfer-query.dto';
import { UpdateCashTransferDto } from './dto/update-cash-transfer.dto';

/** Include both bank names so list/detail can show them. */
const withRelations = {
  fromBankRef: { select: { id: true, bank: true, branch: true } },
  toBankRef: { select: { id: true, bank: true, branch: true } },
} satisfies Prisma.CashTransferInclude;

/** Only a Finished (status 2) transfer actually moves money between banks. */
const FINISH = 2;

/** Prisma transaction client (the `tx` passed to `$transaction(async (tx) => …)`). */
type Tx = Prisma.TransactionClient;

@Injectable()
export class CashTransferService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numbering: NumberingService,
  ) {}

  /**
   * Move `value` between two bank balances inside a transaction.
   *   direction =  1 → apply transfer  (from -= value, to += value)
   *   direction = -1 → reverse transfer (from += value, to -= value)
   */
  private async adjustBalances(
    tx: Tx,
    fromBank: number,
    toBank: number,
    value: Prisma.Decimal | number,
    direction: 1 | -1,
  ) {
    const fromDelta =
      direction === 1 ? { decrement: value } : { increment: value };
    const toDelta =
      direction === 1 ? { increment: value } : { decrement: value };
    await tx.bank.update({
      where: { id: fromBank },
      data: { balance: fromDelta },
    });
    await tx.bank.update({
      where: { id: toBank },
      data: { balance: toDelta },
    });
  }

  async create(createCashTransferDto: CreateCashTransferDto) {
    // Business rule: from_bank and to_bank cannot be equal.
    if (createCashTransferDto.fromBank === createCashTransferDto.toBank) {
      throw new BadRequestException(
        'From Bank and To Bank cannot be the same',
      );
    }
    // status is intentionally dropped: a freshly saved entry is always posted.
    const { date, status: _status, ...rest } = createCashTransferDto;
    void _status;
    try {
      // A new entry is always Finished, so it always moves money. Create the
      // record and adjust both bank balances in one atomic transaction.
      return await this.prisma.$transaction(async (tx) => {
        const cashTransferNo = await this.numbering.next(
          tx,
          NumberPrefix.CashTransfer,
        );
        const created = await tx.cashTransfer.create({
          data: {
            ...rest,
            cashTransfer: cashTransferNo,
            date: new Date(date),
            // Business rule: saving a new entry sets status to 2 (Finish) and
            // stamps the post time server-side.
            status: FINISH,
            postTime: new Date(),
          },
          include: withRelations,
        });
        await this.adjustBalances(tx, rest.fromBank, rest.toBank, rest.value, 1);
        return created;
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindCashTransferQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.CashTransferWhereInput = {
      ...(search && {
        reference: { contains: search, mode: 'insensitive' },
      }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.cashTransfer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withRelations,
      }),
      this.prisma.cashTransfer.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const cashTransfer = await this.prisma.cashTransfer.findUnique({
      where: { id },
      include: withRelations,
    });
    if (!cashTransfer) {
      throw new NotFoundException('Cash Transfer not found');
    }
    return cashTransfer;
  }

  async update(id: number, updateCashTransferDto: UpdateCashTransferDto) {
    const existing = await this.findOne(id);
    // Business rule: from_bank and to_bank cannot be equal (check the merged
    // values, since update may change only one side).
    const from = updateCashTransferDto.fromBank ?? existing.fromBank;
    const to = updateCashTransferDto.toBank ?? existing.toBank;
    if (from === to) {
      throw new BadRequestException(
        'From Bank and To Bank cannot be the same',
      );
    }
    const { date, ...rest } = updateCashTransferDto;
    // Merged post-update values, used to recompute the balance effect.
    const newValue = updateCashTransferDto.value ?? existing.value;
    const newStatus = updateCashTransferDto.status ?? existing.status;
    try {
      // Keep balances consistent by reversing the record's previous effect and
      // applying its new effect (banks, value or status may all have changed).
      // A transfer only moves money while it is Finished (status 2).
      return await this.prisma.$transaction(async (tx) => {
        const updated = await tx.cashTransfer.update({
          where: { id },
          data: {
            ...rest,
            ...(date !== undefined && { date: new Date(date) }),
          },
          include: withRelations,
        });
        if (existing.status === FINISH) {
          await this.adjustBalances(
            tx,
            existing.fromBank,
            existing.toBank,
            existing.value,
            -1,
          );
        }
        if (newStatus === FINISH) {
          await this.adjustBalances(tx, from, to, newValue, 1);
        }
        return updated;
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    // Reverse the transfer's balance effect (if it was Finished) and delete it
    // atomically, so removing a posted transfer restores both bank balances.
    return this.prisma.$transaction(async (tx) => {
      if (existing.status === FINISH) {
        await this.adjustBalances(
          tx,
          existing.fromBank,
          existing.toBank,
          existing.value,
          -1,
        );
      }
      return tx.cashTransfer.delete({ where: { id } });
    });
  }

  private handleError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Foreign key violation (an unknown from_bank or to_bank).
      if (error.code === 'P2003') {
        return new BadRequestException('Invalid bank reference');
      }
    }
    return error;
  }
}
