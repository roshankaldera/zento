import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKotDto } from './dto/create-kot.dto';
import { FindKotQueryDto } from './dto/find-kot-query.dto';
import { UpdateKotDto } from './dto/update-kot.dto';

/** List rows need the parent names and a line count (not the full lines). */
const withListMeta = {
  business: { select: { id: true, name: true } },
  booking: { select: { id: true, customer: true } },
  _count: { select: { lines: true } },
} satisfies Prisma.KotInclude;

/** Detail rows include every line. */
const withDetail = {
  business: { select: { id: true, name: true } },
  booking: { select: { id: true, customer: true } },
  lines: { orderBy: { id: 'asc' } },
} satisfies Prisma.KotInclude;

@Injectable()
export class KotService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createKotDto: CreateKotDto) {
    const { requestTime, lines, ...header } = createKotDto;
    try {
      return await this.prisma.kot.create({
        data: {
          ...header,
          requestTime: new Date(requestTime),
          lines: { create: lines },
        },
        include: withDetail,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindKotQueryDto) {
    const { page = 1, limit = 10, search } = query;

    const where: Prisma.KotWhereInput = {
      ...(search && {
        booking: { customer: { contains: search, mode: 'insensitive' } },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.kot.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withListMeta,
      }),
      this.prisma.kot.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const kot = await this.prisma.kot.findUnique({
      where: { id },
      include: withDetail,
    });
    if (!kot) {
      throw new NotFoundException('KOT not found');
    }
    return kot;
  }

  async update(id: number, updateKotDto: UpdateKotDto) {
    await this.findOne(id);
    const { requestTime, lines, ...header } = updateKotDto;
    try {
      // Lines are fully replaced: drop the old set, then recreate from the
      // incoming payload — all inside one transaction so it is atomic.
      return await this.prisma.$transaction(async (tx) => {
        if (lines !== undefined) {
          await tx.kotLine.deleteMany({ where: { mainId: id } });
        }
        return tx.kot.update({
          where: { id },
          data: {
            ...header,
            ...(requestTime !== undefined && {
              requestTime: new Date(requestTime),
            }),
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
    return this.prisma.kot.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    // Foreign key violation (e.g. an unknown business_id or booking_id).
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException('Invalid business or booking reference');
    }
    return error;
  }
}
