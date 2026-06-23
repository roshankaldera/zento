import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { FindBudgetQueryDto } from './dto/find-budget-query.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

/** List rows need the business name and a line count (not the full lines). */
const withListMeta = {
  business: { select: { id: true, name: true } },
  _count: { select: { lines: true } },
} satisfies Prisma.BudgetInclude;

/** Detail rows include every line with its account (code + name). */
const withDetail = {
  business: { select: { id: true, name: true } },
  lines: {
    orderBy: { id: 'asc' },
    include: { account: { select: { id: true, code: true, name: true } } },
  },
} satisfies Prisma.BudgetInclude;

@Injectable()
export class BudgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBudgetDto: CreateBudgetDto) {
    const { lines, ...header } = createBudgetDto;
    try {
      return await this.prisma.budget.create({
        data: { ...header, lines: { create: lines } },
        include: withDetail,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindBudgetQueryDto) {
    const { page = 1, limit = 10, search, year } = query;

    const where: Prisma.BudgetWhereInput = {
      ...(search && {
        business: { name: { contains: search, mode: 'insensitive' } },
      }),
      ...(year && { year }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.budget.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withListMeta,
      }),
      this.prisma.budget.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: withDetail,
    });
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }
    return budget;
  }

  async update(id: number, updateBudgetDto: UpdateBudgetDto) {
    await this.findOne(id);
    const { lines, ...header } = updateBudgetDto;
    try {
      // Lines are fully replaced: drop the old set, then recreate from the
      // incoming payload — all inside one transaction so it is atomic.
      return await this.prisma.$transaction(async (tx) => {
        if (lines !== undefined) {
          await tx.budgetLine.deleteMany({ where: { mainId: id } });
        }
        return tx.budget.update({
          where: { id },
          data: {
            ...header,
            ...(lines !== undefined && { lines: { create: lines } }),
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
    return this.prisma.budget.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // (business_id, year) unique constraint.
      if (error.code === 'P2002') {
        return new ConflictException(
          'A budget for this business and year already exists',
        );
      }
      // Foreign key violation (unknown business_id or account_id).
      if (error.code === 'P2003') {
        return new BadRequestException('Invalid business or account reference');
      }
    }
    return error;
  }
}
