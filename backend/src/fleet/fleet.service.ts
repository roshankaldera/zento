import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFleetDto } from './dto/create-fleet.dto';
import { FindFleetQueryDto } from './dto/find-fleet-query.dto';
import { UpdateFleetDto } from './dto/update-fleet.dto';

@Injectable()
export class FleetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFleetDto: CreateFleetDto) {
    return this.prisma.fleet.create({ data: createFleetDto });
  }

  async findAll(query: FindFleetQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.FleetWhereInput = {
      ...(search && {
        vehicleNo: { contains: search, mode: 'insensitive' },
      }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.fleet.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.fleet.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const fleet = await this.prisma.fleet.findUnique({ where: { id } });
    if (!fleet) {
      throw new NotFoundException('Fleet not found');
    }
    return fleet;
  }

  async update(id: number, updateFleetDto: UpdateFleetDto) {
    await this.findOne(id);
    return this.prisma.fleet.update({ where: { id }, data: updateFleetDto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.fleet.delete({ where: { id } });
  }
}
