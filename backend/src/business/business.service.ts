import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { CreateBusinessLineDto } from './dto/create-business-line.dto';
import { FindBusinessQueryDto } from './dto/find-business-query.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

/** Business type that owns Estate Divisions. */
const ESTATE = 1;
/** Business type that owns Villa Rooms. */
const VILLA = 2;

/** Detail rows include the type-specific child lines so the edit form prefills. */
const withLines = {
  estateDivisions: { orderBy: { id: 'asc' } },
  villaRooms: { orderBy: { id: 'asc' } },
} satisfies Prisma.BusinessInclude;

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  /** Nested-write block for whichever child table matches the business type. */
  private lineWrites(
    type: number | undefined,
    estateDivisions?: CreateBusinessLineDto[],
    villaRooms?: CreateBusinessLineDto[],
  ): Pick<Prisma.BusinessCreateInput, 'estateDivisions' | 'villaRooms'> {
    return {
      ...(type === ESTATE &&
        estateDivisions?.length && {
          estateDivisions: { create: estateDivisions },
        }),
      ...(type === VILLA &&
        villaRooms?.length && { villaRooms: { create: villaRooms } }),
    };
  }

  async create(createBusinessDto: CreateBusinessDto) {
    const { estateDivisions, villaRooms, ...business } = createBusinessDto;
    try {
      return await this.prisma.business.create({
        data: {
          ...business,
          ...this.lineWrites(business.type, estateDivisions, villaRooms),
        },
        include: withLines,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindBusinessQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.BusinessWhereInput = {
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.business.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.business.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const business = await this.prisma.business.findUnique({
      where: { id },
      include: withLines,
    });
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    return business;
  }

  async update(id: number, updateBusinessDto: UpdateBusinessDto) {
    const existing = await this.findOne(id);
    const { estateDivisions, villaRooms, ...business } = updateBusinessDto;

    // Only touch the child tables when the form actually submitted line data
    // (or changed the type); a pure scalar patch leaves the lines untouched.
    const touchesLines =
      business.type !== undefined ||
      estateDivisions !== undefined ||
      villaRooms !== undefined;

    if (!touchesLines) {
      try {
        return await this.prisma.business.update({
          where: { id },
          data: business,
          include: withLines,
        });
      } catch (error) {
        throw this.handleError(error);
      }
    }

    const effectiveType = business.type ?? existing.type;
    try {
      // Replace strategy: drop both child sets, then recreate the type-specific
      // one — all inside one transaction so it is atomic.
      return await this.prisma.$transaction(async (tx) => {
        await tx.estateDivision.deleteMany({ where: { businessId: id } });
        await tx.villaRoom.deleteMany({ where: { businessId: id } });
        return tx.business.update({
          where: { id },
          data: {
            ...business,
            ...this.lineWrites(effectiveType, estateDivisions, villaRooms),
          },
          include: withLines,
        });
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.business.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const target = error.meta?.target;
      const fields = Array.isArray(target)
        ? target.join(',')
        : String(target ?? '');
      // The child uniques are composite (business_id, name); the business name
      // unique is on `name` alone.
      if (fields.includes('business_id')) {
        return new ConflictException(
          'A division/room with this name already exists',
        );
      }
      return new ConflictException('Business name already exists');
    }
    return error;
  }
}
