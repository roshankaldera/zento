import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKotIngredientDto } from './dto/create-kot-ingredient.dto';
import { FindKotIngredientQueryDto } from './dto/find-kot-ingredient-query.dto';
import { UpdateKotIngredientDto } from './dto/update-kot-ingredient.dto';

/** List rows need only a line count (not the full lines). */
const withListMeta = {
  _count: { select: { lines: true } },
} satisfies Prisma.KotIngredientInclude;

/** Detail rows include every line. */
const withDetail = {
  lines: { orderBy: { id: 'asc' } },
} satisfies Prisma.KotIngredientInclude;

@Injectable()
export class KotIngredientService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createKotIngredientDto: CreateKotIngredientDto) {
    const { date, lines, ...header } = createKotIngredientDto;
    try {
      return await this.prisma.kotIngredient.create({
        data: {
          ...header,
          date: new Date(date),
          lines: { create: lines },
        },
        include: withDetail,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindKotIngredientQueryDto) {
    const { page = 1, limit = 10, search } = query;

    const where: Prisma.KotIngredientWhereInput = {
      ...(search && {
        remark: { contains: search, mode: 'insensitive' },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.kotIngredient.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withListMeta,
      }),
      this.prisma.kotIngredient.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const kotIngredient = await this.prisma.kotIngredient.findUnique({
      where: { id },
      include: withDetail,
    });
    if (!kotIngredient) {
      throw new NotFoundException('KOT Ingredient not found');
    }
    return kotIngredient;
  }

  async update(id: number, updateKotIngredientDto: UpdateKotIngredientDto) {
    await this.findOne(id);
    const { date, lines, ...header } = updateKotIngredientDto;
    try {
      // Lines are fully replaced: drop the old set, then recreate from the
      // incoming payload — all inside one transaction so it is atomic.
      return await this.prisma.$transaction(async (tx) => {
        if (lines !== undefined) {
          await tx.kotIngredientLine.deleteMany({ where: { mainId: id } });
        }
        return tx.kotIngredient.update({
          where: { id },
          data: {
            ...header,
            ...(date !== undefined && { date: new Date(date) }),
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
    return this.prisma.kotIngredient.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    return error;
  }
}
