import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { FindAccountQueryDto } from './dto/find-account-query.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

/**
 * Include the parent group (account category) and business names so list/detail
 * can show them.
 */
const withGroup = {
  group: { select: { id: true, name: true } },
  business: { select: { id: true, name: true } },
} satisfies Prisma.AccountInclude;

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAccountDto: CreateAccountDto) {
    try {
      return await this.prisma.account.create({
        data: createAccountDto,
        include: withGroup,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindAccountQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.AccountWhereInput = {
      ...(search && {
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.account.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withGroup,
      }),
      this.prisma.account.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: withGroup,
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async update(id: number, updateAccountDto: UpdateAccountDto) {
    await this.findOne(id);
    try {
      return await this.prisma.account.update({
        where: { id },
        data: updateAccountDto,
        include: withGroup,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.account.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = error.meta?.target;
        const fields = Array.isArray(target)
          ? target.join(',')
          : String(target ?? '');
        if (fields.includes('code')) {
          return new ConflictException('Account code already exists');
        }
        return new ConflictException('Account name already exists');
      }
      // Foreign key violation (e.g. an unknown group_id or business_id).
      if (error.code === 'P2003') {
        const field = String(error.meta?.field_name ?? '');
        if (field.includes('business')) {
          return new BadRequestException('Invalid business reference');
        }
        return new BadRequestException('Invalid group reference');
      }
    }
    return error;
  }
}
