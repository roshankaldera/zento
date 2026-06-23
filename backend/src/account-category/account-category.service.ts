import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountCategoryDto } from './dto/create-account-category.dto';
import { FindAccountCategoryQueryDto } from './dto/find-account-category-query.dto';
import { UpdateAccountCategoryDto } from './dto/update-account-category.dto';

@Injectable()
export class AccountCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAccountCategoryDto: CreateAccountCategoryDto) {
    try {
      return await this.prisma.accountCategory.create({
        data: createAccountCategoryDto,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindAccountCategoryQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.AccountCategoryWhereInput = {
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.accountCategory.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.accountCategory.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const accountCategory = await this.prisma.accountCategory.findUnique({
      where: { id },
    });
    if (!accountCategory) {
      throw new NotFoundException('Account Category not found');
    }
    return accountCategory;
  }

  async update(
    id: number,
    updateAccountCategoryDto: UpdateAccountCategoryDto,
  ) {
    await this.findOne(id);
    try {
      return await this.prisma.accountCategory.update({
        where: { id },
        data: updateAccountCategoryDto,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.accountCategory.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new ConflictException('Account Category name already exists');
    }
    return error;
  }
}
