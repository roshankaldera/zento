import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLatexHarvestDto } from './dto/create-latex-harvest.dto';
import { FindLatexHarvestQueryDto } from './dto/find-latex-harvest-query.dto';
import { UpdateLatexHarvestDto } from './dto/update-latex-harvest.dto';

/** List rows need the estate name and a line count (not the full lines). */
const withListMeta = {
  estate: { select: { id: true, name: true } },
  _count: { select: { lines: true } },
} satisfies Prisma.LatexHarvestInclude;

/** Detail rows include every line with its employee name. */
const withDetail = {
  estate: { select: { id: true, name: true } },
  lines: {
    orderBy: { id: 'asc' },
    include: {
      employee: { select: { id: true, name: true, empNo: true } },
    },
  },
} satisfies Prisma.LatexHarvestInclude;

@Injectable()
export class LatexHarvestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLatexHarvestDto: CreateLatexHarvestDto) {
    const { date, lines, ...header } = createLatexHarvestDto;
    try {
      return await this.prisma.latexHarvest.create({
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

  async findAll(query: FindLatexHarvestQueryDto) {
    const { page = 1, limit = 10, search } = query;

    const where: Prisma.LatexHarvestWhereInput = {
      ...(search && {
        estate: { name: { contains: search, mode: 'insensitive' } },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.latexHarvest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withListMeta,
      }),
      this.prisma.latexHarvest.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const harvest = await this.prisma.latexHarvest.findUnique({
      where: { id },
      include: withDetail,
    });
    if (!harvest) {
      throw new NotFoundException('Latex Harvest not found');
    }
    return harvest;
  }

  async update(id: number, updateLatexHarvestDto: UpdateLatexHarvestDto) {
    await this.findOne(id);
    const { date, lines, ...header } = updateLatexHarvestDto;
    try {
      // Lines are fully replaced: drop the old set, then recreate from the
      // incoming payload — all inside one transaction so it is atomic.
      return await this.prisma.$transaction(async (tx) => {
        if (lines !== undefined) {
          await tx.latexLine.deleteMany({ where: { mainId: id } });
        }
        return tx.latexHarvest.update({
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
    return this.prisma.latexHarvest.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // (estate_id, date) unique constraint.
      if (error.code === 'P2002') {
        return new ConflictException(
          'A latex harvest for this estate and date already exists',
        );
      }
      // Foreign key violation (e.g. an unknown estate_id or employee_id).
      if (error.code === 'P2003') {
        return new BadRequestException('Invalid estate or employee reference');
      }
    }
    return error;
  }
}
