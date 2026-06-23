import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { FindExchangeRateQueryDto } from './dto/find-exchange-rate-query.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';

@Injectable()
export class ExchangeRateService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createExchangeRateDto: CreateExchangeRateDto) {
    const { date, ...rest } = createExchangeRateDto;
    try {
      return await this.prisma.exchangeRate.create({
        data: { ...rest, date: new Date(date) },
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindExchangeRateQueryDto) {
    const { page = 1, limit = 10 } = query;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.exchangeRate.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.exchangeRate.count(),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const exchangeRate = await this.prisma.exchangeRate.findUnique({
      where: { id },
    });
    if (!exchangeRate) {
      throw new NotFoundException('Exchange Rate not found');
    }
    return exchangeRate;
  }

  async update(id: number, updateExchangeRateDto: UpdateExchangeRateDto) {
    await this.findOne(id);
    const { date, ...rest } = updateExchangeRateDto;
    try {
      return await this.prisma.exchangeRate.update({
        where: { id },
        data: {
          ...rest,
          ...(date !== undefined && { date: new Date(date) }),
        },
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.exchangeRate.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    // (currency_id, date) unique constraint.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new ConflictException(
        'An exchange rate for this currency and date already exists',
      );
    }
    return error;
  }
}
