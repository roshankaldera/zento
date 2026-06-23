import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoconutHarvestDto } from './dto/create-coconut-harvest.dto';
import { FindCoconutHarvestQueryDto } from './dto/find-coconut-harvest-query.dto';
import { UpdateCoconutHarvestDto } from './dto/update-coconut-harvest.dto';

/** List rows need the estate name and a line count (not the full lines). */
const withListMeta = {
  estate: { select: { id: true, name: true } },
  _count: { select: { lines: true } },
} satisfies Prisma.CoconutHarvestInclude;

/** Detail rows include every line with its division name. */
const withDetail = {
  estate: { select: { id: true, name: true } },
  lines: {
    orderBy: { id: 'asc' },
    include: { division: { select: { id: true, name: true } } },
  },
} satisfies Prisma.CoconutHarvestInclude;

@Injectable()
export class CoconutHarvestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCoconutHarvestDto: CreateCoconutHarvestDto) {
    const { date, lines, ...header } = createCoconutHarvestDto;
    try {
      return await this.prisma.coconutHarvest.create({
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

  async findAll(query: FindCoconutHarvestQueryDto) {
    const { page = 1, limit = 10, search } = query;

    const where: Prisma.CoconutHarvestWhereInput = {
      ...(search && {
        estate: { name: { contains: search, mode: 'insensitive' } },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.coconutHarvest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withListMeta,
      }),
      this.prisma.coconutHarvest.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const harvest = await this.prisma.coconutHarvest.findUnique({
      where: { id },
      include: withDetail,
    });
    if (!harvest) {
      throw new NotFoundException('Coconut Harvest not found');
    }
    return harvest;
  }

  async update(id: number, updateCoconutHarvestDto: UpdateCoconutHarvestDto) {
    await this.findOne(id);
    const { date, lines, ...header } = updateCoconutHarvestDto;
    try {
      // Lines are fully replaced: drop the old set, then recreate from the
      // incoming payload — all inside one transaction so it is atomic.
      return await this.prisma.$transaction(async (tx) => {
        if (lines !== undefined) {
          await tx.coconutDivisionLine.deleteMany({ where: { mainId: id } });
        }
        return tx.coconutHarvest.update({
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
    return this.prisma.coconutHarvest.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // (estate_id, date) unique constraint.
      if (error.code === 'P2002') {
        return new ConflictException(
          'A harvest for this estate and date already exists',
        );
      }
      // Foreign key violation (e.g. an unknown estate_id or division_id).
      if (error.code === 'P2003') {
        return new BadRequestException('Invalid estate or division reference');
      }
    }
    return error;
  }
}
