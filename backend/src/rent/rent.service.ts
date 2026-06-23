import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRentDto } from './dto/create-rent.dto';
import { FindRentQueryDto } from './dto/find-rent-query.dto';
import { UpdateRentDto } from './dto/update-rent.dto';

/** Include the parent business + asset names so list/detail can show them. */
const withRelations = {
  business: { select: { id: true, name: true } },
  asset: { select: { id: true, name: true } },
} satisfies Prisma.RentInclude;

@Injectable()
export class RentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRentDto: CreateRentDto) {
    const { startDate, endDate, ...rest } = createRentDto;
    try {
      return await this.prisma.rent.create({
        data: {
          ...rest,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
        include: withRelations,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindRentQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.RentWhereInput = {
      ...(search && {
        tenant: { contains: search, mode: 'insensitive' },
      }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.rent.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withRelations,
      }),
      this.prisma.rent.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const rent = await this.prisma.rent.findUnique({
      where: { id },
      include: withRelations,
    });
    if (!rent) {
      throw new NotFoundException('Rent not found');
    }
    return rent;
  }

  async update(id: number, updateRentDto: UpdateRentDto) {
    await this.findOne(id);
    const { startDate, endDate, ...rest } = updateRentDto;
    try {
      return await this.prisma.rent.update({
        where: { id },
        data: {
          ...rest,
          ...(startDate !== undefined && { startDate: new Date(startDate) }),
          ...(endDate !== undefined && { endDate: new Date(endDate) }),
        },
        include: withRelations,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.rent.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    // Foreign key violation (e.g. an unknown business_id or asset_id).
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException('Invalid business or asset reference');
    }
    return error;
  }
}
