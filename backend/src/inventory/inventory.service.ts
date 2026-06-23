import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { FindInventoryQueryDto } from './dto/find-inventory-query.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

/** List rows need only a line count (not the full lines). */
const withListMeta = {
  _count: { select: { lines: true } },
} satisfies Prisma.InventoryInclude;

/** Detail rows include every stock line with its business name. */
const withDetail = {
  lines: {
    orderBy: { id: 'asc' },
    include: { business: { select: { id: true, name: true } } },
  },
} satisfies Prisma.InventoryInclude;

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInventoryDto: CreateInventoryDto) {
    const { lines, ...header } = createInventoryDto;
    try {
      return await this.prisma.inventory.create({
        data: { ...header, lines: { create: lines } },
        include: withDetail,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindInventoryQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.InventoryWhereInput = {
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.inventory.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withListMeta,
      }),
      this.prisma.inventory.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: withDetail,
    });
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }
    return inventory;
  }

  async update(id: number, updateInventoryDto: UpdateInventoryDto) {
    await this.findOne(id);
    const { lines, ...header } = updateInventoryDto;
    try {
      // Lines are fully replaced: drop the old set, then recreate from the
      // incoming payload — all inside one transaction so it is atomic.
      return await this.prisma.$transaction(async (tx) => {
        if (lines !== undefined) {
          await tx.inventoryStock.deleteMany({ where: { mainId: id } });
        }
        return tx.inventory.update({
          where: { id },
          data: {
            ...header,
            ...(lines !== undefined && { lines: { create: lines } }),
          },
          include: withDetail,
        });
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.inventory.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new ConflictException('Inventory name already exists');
      }
      // Foreign key violation (e.g. an unknown business_id in a line).
      if (error.code === 'P2003') {
        return new BadRequestException('Invalid business reference');
      }
    }
    return error;
  }
}
