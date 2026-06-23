import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { FindBankQueryDto } from './dto/find-bank-query.dto';
import { UpdateBankDto } from './dto/update-bank.dto';

/** Include the parent business name so list/detail can show it. */
const withBusiness = {
  business: { select: { id: true, name: true } },
} satisfies Prisma.BankInclude;

@Injectable()
export class BankService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBankDto: CreateBankDto) {
    try {
      return await this.prisma.bank.create({
        data: createBankDto,
        include: withBusiness,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindBankQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.BankWhereInput = {
      ...(search && {
        bank: { contains: search, mode: 'insensitive' },
      }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.bank.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withBusiness,
      }),
      this.prisma.bank.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const bank = await this.prisma.bank.findUnique({
      where: { id },
      include: withBusiness,
    });
    if (!bank) {
      throw new NotFoundException('Bank not found');
    }
    return bank;
  }

  async update(id: number, updateBankDto: UpdateBankDto) {
    await this.findOne(id);
    try {
      return await this.prisma.bank.update({
        where: { id },
        data: updateBankDto,
        include: withBusiness,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.bank.delete({ where: { id } });
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
