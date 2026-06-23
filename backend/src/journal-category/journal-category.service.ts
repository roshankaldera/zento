import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJournalCategoryDto } from './dto/create-journal-category.dto';
import { FindJournalCategoryQueryDto } from './dto/find-journal-category-query.dto';
import { UpdateJournalCategoryDto } from './dto/update-journal-category.dto';

@Injectable()
export class JournalCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createJournalCategoryDto: CreateJournalCategoryDto) {
    try {
      return await this.prisma.journalCategory.create({
        data: createJournalCategoryDto,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindJournalCategoryQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.JournalCategoryWhereInput = {
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.journalCategory.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.journalCategory.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const journalCategory = await this.prisma.journalCategory.findUnique({
      where: { id },
    });
    if (!journalCategory) {
      throw new NotFoundException('Journal Category not found');
    }
    return journalCategory;
  }

  async update(
    id: number,
    updateJournalCategoryDto: UpdateJournalCategoryDto,
  ) {
    await this.findOne(id);
    try {
      return await this.prisma.journalCategory.update({
        where: { id },
        data: updateJournalCategoryDto,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.journalCategory.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new ConflictException('Journal Category name already exists');
    }
    return error;
  }
}
