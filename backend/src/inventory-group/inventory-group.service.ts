import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryGroupDto } from './dto/create-inventory-group.dto';
import { FindInventoryGroupQueryDto } from './dto/find-inventory-group-query.dto';
import { UpdateInventoryGroupDto } from './dto/update-inventory-group.dto';

@Injectable()
export class InventoryGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInventoryGroupDto: CreateInventoryGroupDto) {
    try {
      return await this.prisma.inventoryGroup.create({
        data: createInventoryGroupDto,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindInventoryGroupQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.InventoryGroupWhereInput = {
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.inventoryGroup.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.inventoryGroup.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const inventoryGroup = await this.prisma.inventoryGroup.findUnique({
      where: { id },
    });
    if (!inventoryGroup) {
      throw new NotFoundException('Inventory Group not found');
    }
    return inventoryGroup;
  }

  async update(
    id: number,
    updateInventoryGroupDto: UpdateInventoryGroupDto,
  ) {
    await this.findOne(id);
    try {
      return await this.prisma.inventoryGroup.update({
        where: { id },
        data: updateInventoryGroupDto,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.inventoryGroup.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new ConflictException('Inventory Group name already exists');
    }
    return error;
  }
}
