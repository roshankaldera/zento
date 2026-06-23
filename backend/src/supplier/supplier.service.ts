import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { FindSupplierQueryDto } from './dto/find-supplier-query.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto) {
    try {
      return await this.prisma.supplier.create({ data: createSupplierDto });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindSupplierQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.SupplierWhereInput = {
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.supplier.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    return supplier;
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    await this.findOne(id);
    try {
      return await this.prisma.supplier.update({
        where: { id },
        data: updateSupplierDto,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.supplier.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new ConflictException('Supplier name already exists');
    }
    return error;
  }
}
