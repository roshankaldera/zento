import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSoloarDto } from './dto/create-soloar.dto';
import { FindSoloarQueryDto } from './dto/find-soloar-query.dto';
import { UpdateSoloarDto } from './dto/update-soloar.dto';

/** Include the referenced solar asset name so list/detail can show it. */
const withAsset = {
  asset: { select: { id: true, name: true } },
} satisfies Prisma.SoloarInclude;

@Injectable()
export class SoloarService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSoloarDto: CreateSoloarDto) {
    const { date, ...rest } = createSoloarDto;
    try {
      return await this.prisma.soloar.create({
        data: { ...rest, date: new Date(date) },
        include: withAsset,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindSoloarQueryDto) {
    const { page = 1, limit = 10, search } = query;

    const where: Prisma.SoloarWhereInput = {
      ...(search && {
        asset: { name: { contains: search, mode: 'insensitive' } },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.soloar.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withAsset,
      }),
      this.prisma.soloar.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const soloar = await this.prisma.soloar.findUnique({
      where: { id },
      include: withAsset,
    });
    if (!soloar) {
      throw new NotFoundException('Soloar not found');
    }
    return soloar;
  }

  async update(id: number, updateSoloarDto: UpdateSoloarDto) {
    await this.findOne(id);
    const { date, ...rest } = updateSoloarDto;
    try {
      return await this.prisma.soloar.update({
        where: { id },
        data: {
          ...rest,
          ...(date !== undefined && { date: new Date(date) }),
        },
        include: withAsset,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.soloar.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    // Foreign key violation (e.g. an unknown soloar_id / asset).
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException('Invalid soloar (asset) reference');
    }
    return error;
  }
}
