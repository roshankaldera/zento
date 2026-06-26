import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingPriceDto } from './dto/create-booking-price.dto';
import { FindBookingPriceQueryDto } from './dto/find-booking-price-query.dto';
import { UpdateBookingPriceDto } from './dto/update-booking-price.dto';

/** List rows carry the business name + a line count (not the full lines). */
const withListMeta = {
  business: { select: { id: true, name: true } },
  _count: { select: { lines: true } },
} satisfies Prisma.BookingPriceListInclude;

/** Detail rows include the business name and every price line. */
const withDetail = {
  business: { select: { id: true, name: true } },
  lines: { orderBy: { id: 'asc' } },
} satisfies Prisma.BookingPriceListInclude;

@Injectable()
export class BookingPriceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookingPriceDto: CreateBookingPriceDto) {
    const { lines, fromDate, toDate, ...header } = createBookingPriceDto;
    await this.assertNoDateOverlap(
      header.businessId,
      new Date(fromDate),
      new Date(toDate),
    );
    try {
      return await this.prisma.bookingPriceList.create({
        data: {
          ...header,
          fromDate: new Date(fromDate),
          toDate: new Date(toDate),
          lines: { create: lines },
        },
        include: withDetail,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindBookingPriceQueryDto) {
    const { page = 1, limit = 10, search } = query;

    const where: Prisma.BookingPriceListWhereInput = {
      ...(search && {
        business: { name: { contains: search, mode: 'insensitive' } },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.bookingPriceList.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withListMeta,
      }),
      this.prisma.bookingPriceList.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const bookingPrice = await this.prisma.bookingPriceList.findUnique({
      where: { id },
      include: withDetail,
    });
    if (!bookingPrice) {
      throw new NotFoundException('Booking price list not found');
    }
    return bookingPrice;
  }

  async update(id: number, updateBookingPriceDto: UpdateBookingPriceDto) {
    const existing = await this.findOne(id);
    const { lines, fromDate, toDate, ...header } = updateBookingPriceDto;
    await this.assertNoDateOverlap(
      header.businessId ?? existing.businessId,
      fromDate !== undefined ? new Date(fromDate) : existing.fromDate,
      toDate !== undefined ? new Date(toDate) : existing.toDate,
      id,
    );
    try {
      // Lines are fully replaced: drop the old set, then recreate from the
      // incoming payload — all inside one transaction so it is atomic.
      return await this.prisma.$transaction(async (tx) => {
        if (lines !== undefined) {
          await tx.bookingPriceLine.deleteMany({ where: { mainId: id } });
        }
        return tx.bookingPriceList.update({
          where: { id },
          data: {
            ...header,
            ...(fromDate !== undefined && { fromDate: new Date(fromDate) }),
            ...(toDate !== undefined && { toDate: new Date(toDate) }),
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
    // Lines are removed via the cascade on the relation.
    return this.prisma.bookingPriceList.delete({ where: { id } });
  }

  /**
   * Reject a price list whose date range overlaps another for the same
   * business. Two ranges overlap when fromDate <= other.toDate AND
   * toDate >= other.fromDate. `excludeId` skips the record being updated.
   */
  private async assertNoDateOverlap(
    businessId: number,
    fromDate: Date,
    toDate: Date,
    excludeId?: number,
  ) {
    const conflict = await this.prisma.bookingPriceList.findFirst({
      where: {
        businessId,
        fromDate: { lte: toDate },
        toDate: { gte: fromDate },
        ...(excludeId !== undefined && { id: { not: excludeId } }),
      },
      select: { id: true },
    });

    if (conflict) {
      throw new ConflictException(
        'A price list for this business already overlaps the selected date range.',
      );
    }
  }

  private handleError(error: unknown) {
    // Foreign key violation (e.g. an unknown business_id).
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException('Invalid business reference');
    }
    return error;
  }
}
