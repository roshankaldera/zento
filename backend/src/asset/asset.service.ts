import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { FindAssetQueryDto } from './dto/find-asset-query.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAssetDto: CreateAssetDto) {
    try {
      return await this.prisma.asset.create({ data: createAssetDto });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindAssetQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.AssetWhereInput = {
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.asset.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.asset.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    return asset;
  }

  async update(id: number, updateAssetDto: UpdateAssetDto) {
    await this.findOne(id);
    try {
      return await this.prisma.asset.update({
        where: { id },
        data: updateAssetDto,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.asset.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new ConflictException('Asset name already exists');
    }
    return error;
  }
}
