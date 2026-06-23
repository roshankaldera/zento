import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { FindEmployeeQueryDto } from './dto/find-employee-query.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

/** Include the parent business name so list/detail can show it. */
const withBusiness = {
  business: { select: { id: true, name: true } },
} satisfies Prisma.EmployeeInclude;

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const { dob, ...rest } = createEmployeeDto;
    try {
      return await this.prisma.employee.create({
        data: { ...rest, dob: dob ? new Date(dob) : null },
        include: withBusiness,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindEmployeeQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.EmployeeWhereInput = {
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withBusiness,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: withBusiness,
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    await this.findOne(id);
    const { dob, ...rest } = updateEmployeeDto;
    try {
      return await this.prisma.employee.update({
        where: { id },
        data: {
          ...rest,
          ...(dob !== undefined && { dob: dob ? new Date(dob) : null }),
        },
        include: withBusiness,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.employee.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = error.meta?.target;
        const fields = Array.isArray(target) ? target.join(',') : String(target ?? '');
        if (fields.includes('nic')) {
          return new ConflictException('Employee NIC already exists');
        }
        if (fields.includes('emp')) {
          return new ConflictException('Employee number already exists');
        }
        return new ConflictException('Employee already exists');
      }
      // Foreign key violation (e.g. an unknown business_id).
      if (error.code === 'P2003') {
        return new BadRequestException('Invalid business reference');
      }
    }
    return error;
  }
}
