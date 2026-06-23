import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { FindCropQueryDto } from './dto/find-crop-query.dto';
import { UpdateCropDto } from './dto/update-crop.dto';

@Injectable()
export class CropService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCropDto: CreateCropDto) {
    try {
      return await this.prisma.crop.create({ data: createCropDto });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindCropQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.CropWhereInput = {
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.crop.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.crop.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const crop = await this.prisma.crop.findUnique({ where: { id } });
    if (!crop) {
      throw new NotFoundException('Crop not found');
    }
    return crop;
  }

  async update(id: number, updateCropDto: UpdateCropDto) {
    await this.findOne(id);
    try {
      return await this.prisma.crop.update({
        where: { id },
        data: updateCropDto,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.crop.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new ConflictException('Crop name already exists');
    }
    return error;
  }
}
