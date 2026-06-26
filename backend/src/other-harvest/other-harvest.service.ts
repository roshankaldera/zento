import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOtherHarvestDto } from './dto/create-other-harvest.dto';
import { FindOtherHarvestQueryDto } from './dto/find-other-harvest-query.dto';
import { UpdateOtherHarvestDto } from './dto/update-other-harvest.dto';

/** Include the estate/supplier/crop names so list/detail can show them. */
const withRelations = {
  estate: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
  crop: { select: { id: true, name: true } },
} satisfies Prisma.OtherHarvestInclude;

@Injectable()
export class OtherHarvestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOtherHarvestDto: CreateOtherHarvestDto) {
    const { date, ...rest } = createOtherHarvestDto;
    try {
      return await this.prisma.otherHarvest.create({
        data: { ...rest, date: new Date(date) },
        include: withRelations,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindOtherHarvestQueryDto) {
    const { page = 1, limit = 10, search } = query;

    const where: Prisma.OtherHarvestWhereInput = {
      ...(search && {
        OR: [
          { reference: { contains: search, mode: 'insensitive' } },
          { supplier: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.otherHarvest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withRelations,
      }),
      this.prisma.otherHarvest.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const otherHarvest = await this.prisma.otherHarvest.findUnique({
      where: { id },
      include: withRelations,
    });
    if (!otherHarvest) {
      throw new NotFoundException('Other harvest not found');
    }
    return otherHarvest;
  }

  async update(id: number, updateOtherHarvestDto: UpdateOtherHarvestDto) {
    await this.findOne(id);
    const { date, ...rest } = updateOtherHarvestDto;
    try {
      return await this.prisma.otherHarvest.update({
        where: { id },
        data: {
          ...rest,
          ...(date !== undefined && { date: new Date(date) }),
        },
        include: withRelations,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.otherHarvest.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    // Foreign key violation (e.g. an unknown estate/supplier/crop id).
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException('Invalid estate, supplier, or crop reference');
    }
    return error;
  }
}
