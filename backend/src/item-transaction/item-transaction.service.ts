import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemTransactionDto } from './dto/create-item-transaction.dto';
import { CreateItemTransactionLineDto } from './dto/create-item-transaction-line.dto';
import { FindItemTransactionQueryDto } from './dto/find-item-transaction-query.dto';
import { UpdateItemTransactionDto } from './dto/update-item-transaction.dto';

/** List rows need the business name and a line count (not the full lines). */
const withListMeta = {
  business: { select: { id: true, name: true } },
  requester: { select: { id: true, name: true, empNo: true } },
  _count: { select: { lines: true } },
} satisfies Prisma.ItemTransactionInclude;

/** Detail rows include every line with its item (inventory) name. */
const withDetail = {
  business: { select: { id: true, name: true } },
  requester: { select: { id: true, name: true, empNo: true } },
  lines: {
    orderBy: { id: 'asc' },
    include: { inventory: { select: { id: true, name: true } } },
  },
} satisfies Prisma.ItemTransactionInclude;

/** Round a money value to 2 decimal places. */
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

@Injectable()
export class ItemTransactionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Recompute every derived line value (`total = quantity * price`) and the
   * derived header `total` (sum of the line totals). Client-sent computed
   * values are never trusted — they are always recomputed here.
   */
  private computeTotals(lines: CreateItemTransactionLineDto[]) {
    const computedLines = lines.map((line) => ({
      itemId: line.itemId,
      description: line.description ?? null,
      quantity: line.quantity,
      price: line.price,
      total: round2(Number(line.quantity) * Number(line.price)),
    }));
    const total = round2(
      computedLines.reduce((sum, line) => sum + line.total, 0),
    );
    return { computedLines, total };
  }

  async create(createItemTransactionDto: CreateItemTransactionDto) {
    const { date, lines, ...header } = createItemTransactionDto;
    const { computedLines, total } = this.computeTotals(lines);
    try {
      return await this.prisma.itemTransaction.create({
        data: {
          ...header,
          date: new Date(date),
          total,
          lines: { create: computedLines },
        },
        include: withDetail,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindItemTransactionQueryDto) {
    const { page = 1, limit = 10, search, type } = query;

    const where: Prisma.ItemTransactionWhereInput = {
      ...(search && {
        business: { name: { contains: search, mode: 'insensitive' } },
      }),
      ...(type && { type }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.itemTransaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withListMeta,
      }),
      this.prisma.itemTransaction.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const transaction = await this.prisma.itemTransaction.findUnique({
      where: { id },
      include: withDetail,
    });
    if (!transaction) {
      throw new NotFoundException('Item Transaction not found');
    }
    return transaction;
  }

  async update(
    id: number,
    updateItemTransactionDto: UpdateItemTransactionDto,
  ) {
    await this.findOne(id);
    const { date, lines, ...header } = updateItemTransactionDto;
    const computed = lines ? this.computeTotals(lines) : undefined;
    try {
      // Lines are fully replaced: drop the old set, then recreate from the
      // incoming payload — all inside one transaction so it is atomic.
      return await this.prisma.$transaction(async (tx) => {
        if (computed) {
          await tx.itemTransactionLine.deleteMany({ where: { mainId: id } });
        }
        return tx.itemTransaction.update({
          where: { id },
          data: {
            ...header,
            ...(date !== undefined && { date: new Date(date) }),
            ...(computed && {
              total: computed.total,
              lines: { create: computed.computedLines },
            }),
          },
          include: withDetail,
        });
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    // Child lines are removed automatically via onDelete: Cascade.
    return this.prisma.itemTransaction.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new ConflictException('Item Transaction already exists');
      }
      // Foreign key violation (unknown business_id, request_by or item_id).
      if (error.code === 'P2003') {
        return new BadRequestException(
          'Invalid business, employee or item reference',
        );
      }
    }
    return error;
  }
}
