import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NumberingService, NumberPrefix } from '../numbering/numbering.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { FindBookingQueryDto } from './dto/find-booking-query.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

/** Include the parent business name so list/detail can show it. */
const withBusiness = {
  business: { select: { id: true, name: true } },
} satisfies Prisma.BookingInclude;

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numbering: NumberingService,
  ) {}

  async create(createBookingDto: CreateBookingDto) {
    const { fromDate, toDate, ...rest } = createBookingDto;
    await this.assertNoRoomOverlap(
      rest.businessId,
      rest.roomIds,
      new Date(fromDate),
      new Date(toDate),
    );
    try {
      // Number generation + create run in one transaction so the sequence is
      // only consumed if the booking commits.
      return await this.prisma.$transaction(async (tx) => {
        const bookingNo = await this.numbering.next(tx, NumberPrefix.Booking);
        return tx.booking.create({
          data: {
            ...rest,
            bookingNo,
            fromDate: new Date(fromDate),
            toDate: new Date(toDate),
          },
          include: withBusiness,
        });
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindBookingQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.BookingWhereInput = {
      ...(search && {
        customer: { contains: search, mode: 'insensitive' },
      }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withBusiness,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: withBusiness,
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async update(id: number, updateBookingDto: UpdateBookingDto) {
    const existing = await this.findOne(id);
    const { fromDate, toDate, ...rest } = updateBookingDto;
    // Validate against the effective (merged) room/date range, ignoring this
    // record itself.
    await this.assertNoRoomOverlap(
      rest.businessId ?? existing.businessId,
      rest.roomIds ?? existing.roomIds,
      fromDate !== undefined ? new Date(fromDate) : existing.fromDate,
      toDate !== undefined ? new Date(toDate) : existing.toDate,
      id,
    );
    try {
      return await this.prisma.booking.update({
        where: { id },
        data: {
          ...rest,
          ...(fromDate !== undefined && { fromDate: new Date(fromDate) }),
          ...(toDate !== undefined && { toDate: new Date(toDate) }),
        },
        include: withBusiness,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.booking.delete({ where: { id } });
    } catch (error) {
      // FK violation: the booking still has linked KOTs.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Cannot delete a booking that has linked KOTs. Delete the KOTs first.',
        );
      }
      throw error;
    }
  }

  /**
   * Reject a booking that double-books a villa room. Two bookings clash when
   * they belong to the same business, share at least one room, and their
   * inclusive date ranges overlap (fromDate <= other.toDate AND
   * toDate >= other.fromDate). `excludeId` skips the record being updated.
   */
  private async assertNoRoomOverlap(
    businessId: number,
    roomIds: number[],
    fromDate: Date,
    toDate: Date,
    excludeId?: number,
  ) {
    const conflict = await this.prisma.booking.findFirst({
      where: {
        businessId,
        roomIds: { hasSome: roomIds },
        fromDate: { lte: toDate },
        toDate: { gte: fromDate },
        ...(excludeId !== undefined && { id: { not: excludeId } }),
      },
      select: { bookingNo: true, roomIds: true },
    });

    if (!conflict) return;

    const clashingIds = conflict.roomIds.filter((r) => roomIds.includes(r));
    const rooms = await this.prisma.villaRoom.findMany({
      where: { id: { in: clashingIds } },
      select: { name: true },
    });
    const roomLabel = rooms.map((r) => r.name).join(', ') || 'room';
    const ref = conflict.bookingNo ? ` (booking ${conflict.bookingNo})` : '';

    throw new ConflictException(
      `${roomLabel} already booked for the selected dates${ref}.`,
    );
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
