import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { CreateRecurringLineDto } from './dto/create-recurring-line.dto';
import { FindRecurringQueryDto } from './dto/find-recurring-query.dto';
import { UpdateRecurringDto } from './dto/update-recurring.dto';

/** List rows need the related names and a line count (not the full lines). */
const withListMeta = {
  business: { select: { id: true, name: true } },
  bank: { select: { id: true, bank: true } },
  journalCategory: { select: { id: true, name: true } },
  _count: { select: { lines: true } },
} satisfies Prisma.RecurringInclude;

/** Detail rows include every line (scalar FKs prefill the edit form). */
const withDetail = {
  business: { select: { id: true, name: true } },
  bank: { select: { id: true, bank: true } },
  journalCategory: { select: { id: true, name: true } },
  lines: { orderBy: { id: 'asc' } },
} satisfies Prisma.RecurringInclude;

@Injectable()
export class RecurringService {
  constructor(private readonly prisma: PrismaService) {}

  /** Normalise a line for Prisma (coerce optional FKs to null). */
  private toLineData(line: CreateRecurringLineDto) {
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

  async create(createRecurringDto: CreateRecurringDto) {
    const { fromPeriod, toPeriod, lines, ...header } = createRecurringDto;
    try {
      return await this.prisma.recurring.create({
        data: {
          ...header,
          fromPeriod: fromPeriod ? new Date(fromPeriod) : null,
          toPeriod: toPeriod ? new Date(toPeriod) : null,
          lines: { create: lines.map((line) => this.toLineData(line)) },
        },
        include: withDetail,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindRecurringQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.RecurringWhereInput = {
      ...(search && {
        business: { name: { contains: search, mode: 'insensitive' } },
      }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.recurring.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withListMeta,
      }),
      this.prisma.recurring.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const recurring = await this.prisma.recurring.findUnique({
      where: { id },
      include: withDetail,
    });
    if (!recurring) {
      throw new NotFoundException('Recurring not found');
    }
    return recurring;
  }

  async update(id: number, updateRecurringDto: UpdateRecurringDto) {
    await this.findOne(id);
    const { fromPeriod, toPeriod, lines, ...header } = updateRecurringDto;
    try {
      // Lines are fully replaced: drop the old set, then recreate from the
      // incoming payload — all inside one transaction so it is atomic.
      return await this.prisma.$transaction(async (tx) => {
        if (lines !== undefined) {
          await tx.recurringLine.deleteMany({ where: { mainId: id } });
        }
        return tx.recurring.update({
          where: { id },
          data: {
            ...header,
            ...(fromPeriod !== undefined && {
              fromPeriod: fromPeriod ? new Date(fromPeriod) : null,
            }),
            ...(toPeriod !== undefined && {
              toPeriod: toPeriod ? new Date(toPeriod) : null,
            }),
            ...(lines !== undefined && {
              lines: { create: lines.map((line) => this.toLineData(line)) },
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
    return this.prisma.recurring.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new ConflictException('Recurring already exists');
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
