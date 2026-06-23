import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { FindLeaveQueryDto } from './dto/find-leave-query.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';

/** Include the employee name/number so list/detail can show it. */
const withEmployee = {
  employee: { select: { id: true, name: true, empNo: true } },
} satisfies Prisma.LeaveInclude;

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLeaveDto: CreateLeaveDto) {
    const { date, ...rest } = createLeaveDto;
    try {
      return await this.prisma.leave.create({
        data: { ...rest, date: new Date(date) },
        include: withEmployee,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindLeaveQueryDto) {
    const { page = 1, limit = 10, search } = query;

    const where: Prisma.LeaveWhereInput = {
      ...(search && {
        employee: { name: { contains: search, mode: 'insensitive' } },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.leave.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withEmployee,
      }),
      this.prisma.leave.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const leave = await this.prisma.leave.findUnique({
      where: { id },
      include: withEmployee,
    });
    if (!leave) {
      throw new NotFoundException('Leave not found');
    }
    return leave;
  }

  async update(id: number, updateLeaveDto: UpdateLeaveDto) {
    await this.findOne(id);
    const { date, ...rest } = updateLeaveDto;
    try {
      return await this.prisma.leave.update({
        where: { id },
        data: {
          ...rest,
          ...(date !== undefined && { date: new Date(date) }),
        },
        include: withEmployee,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.leave.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // (employee_id, date) unique constraint.
      if (error.code === 'P2002') {
        return new ConflictException(
          'Leave for this employee and date already exists',
        );
      }
      // Foreign key violation (e.g. an unknown employee_id).
      if (error.code === 'P2003') {
        return new BadRequestException('Invalid employee reference');
      }
    }
    return error;
  }
}
