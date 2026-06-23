import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { FindAttendanceQueryDto } from './dto/find-attendance-query.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

/** List rows only need the parent business name and a line count. */
const withListMeta = {
  business: { select: { id: true, name: true } },
  _count: { select: { lines: true } },
} satisfies Prisma.AttendanceInclude;

/** Detail rows include every line with its employee name. */
const withDetail = {
  business: { select: { id: true, name: true } },
  lines: {
    orderBy: { id: 'asc' },
    include: {
      employee: { select: { id: true, name: true, empNo: true } },
    },
  },
} satisfies Prisma.AttendanceInclude;

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    const { date, lines, ...rest } = createAttendanceDto;
    try {
      return await this.prisma.attendance.create({
        data: {
          ...rest,
          date: new Date(date),
          lines: { create: lines },
        },
        include: withDetail,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindAttendanceQueryDto) {
    const { page = 1, limit = 10 } = query;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.attendance.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withListMeta,
      }),
      this.prisma.attendance.count(),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: withDetail,
    });
    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }
    return attendance;
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    await this.findOne(id);
    const { date, lines, ...rest } = updateAttendanceDto;
    try {
      // Lines are fully replaced: drop the old set, then recreate from the
      // incoming payload — all inside one transaction so it is atomic.
      return await this.prisma.$transaction(async (tx) => {
        if (lines !== undefined) {
          await tx.attendanceLine.deleteMany({ where: { mainId: id } });
        }
        return tx.attendance.update({
          where: { id },
          data: {
            ...rest,
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
    return this.prisma.attendance.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = error.meta?.target;
        const fields = Array.isArray(target)
          ? target.join(',')
          : String(target ?? '');
        // (main_id, employee_id, shift) → a duplicated line; otherwise the
        // (business_id, date) header constraint.
        if (fields.includes('employee') || fields.includes('shift')) {
          return new ConflictException(
            'This employee and shift already exist for the selected business and date',
          );
        }
        return new ConflictException(
          'An attendance for this business and date already exists',
        );
      }
      // Foreign key violation (e.g. an unknown business_id or employee_id).
      if (error.code === 'P2003') {
        return new BadRequestException(
          'Invalid business or employee reference',
        );
      }
    }
    return error;
  }
}
