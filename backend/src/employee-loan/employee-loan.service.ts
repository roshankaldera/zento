import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeLoanDto } from './dto/create-employee-loan.dto';
import { FindEmployeeLoanQueryDto } from './dto/find-employee-loan-query.dto';
import { UpdateEmployeeLoanDto } from './dto/update-employee-loan.dto';

/** Include the employee name/number so list/detail can show it. */
const withEmployee = {
  employee: { select: { id: true, name: true, empNo: true } },
} satisfies Prisma.EmployeeLoanInclude;

@Injectable()
export class EmployeeLoanService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEmployeeLoanDto: CreateEmployeeLoanDto) {
    const { issueDate, ...rest } = createEmployeeLoanDto;
    try {
      return await this.prisma.employeeLoan.create({
        data: { ...rest, issueDate: issueDate ? new Date(issueDate) : null },
        include: withEmployee,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindEmployeeLoanQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.EmployeeLoanWhereInput = {
      ...(search && {
        employee: { name: { contains: search, mode: 'insensitive' } },
      }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.employeeLoan.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withEmployee,
      }),
      this.prisma.employeeLoan.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const loan = await this.prisma.employeeLoan.findUnique({
      where: { id },
      include: withEmployee,
    });
    if (!loan) {
      throw new NotFoundException('Employee Loan not found');
    }
    return loan;
  }

  async update(id: number, updateEmployeeLoanDto: UpdateEmployeeLoanDto) {
    await this.findOne(id);
    const { issueDate, ...rest } = updateEmployeeLoanDto;
    try {
      return await this.prisma.employeeLoan.update({
        where: { id },
        data: {
          ...rest,
          ...(issueDate !== undefined && {
            issueDate: issueDate ? new Date(issueDate) : null,
          }),
        },
        include: withEmployee,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.employeeLoan.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    // Foreign key violation (e.g. an unknown employee_id).
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException('Invalid employee reference');
    }
    return error;
  }
}
