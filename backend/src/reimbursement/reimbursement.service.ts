import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NumberingService, NumberPrefix } from '../numbering/numbering.service';
import { CreateReimbursementDto } from './dto/create-reimbursement.dto';
import { CreateReimbursementLineDto } from './dto/create-reimbursement-line.dto';
import { FindReimbursementQueryDto } from './dto/find-reimbursement-query.dto';
import { UpdateReimbursementDto } from './dto/update-reimbursement.dto';

/** List rows need the business name and a line count (not the full lines). */
const withListMeta = {
  business: { select: { id: true, name: true } },
  _count: { select: { lines: true } },
} satisfies Prisma.ReimbursementInclude;

/** Detail rows include every line. */
const withDetail = {
  business: { select: { id: true, name: true } },
  lines: { orderBy: { id: 'asc' } },
} satisfies Prisma.ReimbursementInclude;

/** Round a money value to 2 decimal places. */
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

@Injectable()
export class ReimbursementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numbering: NumberingService,
  ) {}

  /**
   * Recompute the derived header `total_value` (sum of the line values). The
   * client-sent total is never trusted — it is always recomputed here.
   */
  private computeTotal(lines: CreateReimbursementLineDto[]): number {
    return round2(lines.reduce((sum, line) => sum + Number(line.value), 0));
  }

  /** Normalise a line for Prisma (convert the optional bill date). */
  private toLineData(line: CreateReimbursementLineDto) {
    return {
      billDate: line.billDate ? new Date(line.billDate) : null,
      description: line.description ?? null,
      reference: line.reference ?? null,
      value: line.value,
    };
  }

  async create(createReimbursementDto: CreateReimbursementDto) {
    // status is dropped: a freshly saved entry is always posted (Finish).
    // reimbursementNo is dropped too: it is generated server-side on save.
    const {
      date,
      lines,
      status: _status,
      reimbursementNo: _reimbursementNo,
      ...header
    } = createReimbursementDto;
    void _status;
    void _reimbursementNo;
    try {
      // Number generation + create run in one transaction so the sequence is
      // only consumed if the record commits.
      return await this.prisma.$transaction(async (tx) => {
        const reimbursementNo = await this.numbering.next(
          tx,
          NumberPrefix.Reimbursement,
        );
        return tx.reimbursement.create({
          data: {
            ...header,
            reimbursementNo,
            date: new Date(date),
            totalValue: this.computeTotal(lines),
            // Business rule: saving a new entry sets status to 2 (Finish) and
            // stamps the post time server-side.
            status: 2,
            postTime: new Date(),
            lines: { create: lines.map((line) => this.toLineData(line)) },
          },
          include: withDetail,
        });
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindReimbursementQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.ReimbursementWhereInput = {
      ...(search && {
        reimbursementNo: { contains: search, mode: 'insensitive' },
      }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.reimbursement.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: withListMeta,
      }),
      this.prisma.reimbursement.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const reimbursement = await this.prisma.reimbursement.findUnique({
      where: { id },
      include: withDetail,
    });
    if (!reimbursement) {
      throw new NotFoundException('Reimbursement not found');
    }
    return reimbursement;
  }

  async update(id: number, updateReimbursementDto: UpdateReimbursementDto) {
    await this.findOne(id);
    const { date, lines, ...header } = updateReimbursementDto;
    try {
      // Lines are fully replaced: drop the old set, then recreate from the
      // incoming payload — all inside one transaction so it is atomic.
      return await this.prisma.$transaction(async (tx) => {
        if (lines !== undefined) {
          await tx.reimbursementLine.deleteMany({ where: { mainId: id } });
        }
        return tx.reimbursement.update({
          where: { id },
          data: {
            ...header,
            ...(date !== undefined && { date: new Date(date) }),
            ...(lines !== undefined && {
              totalValue: this.computeTotal(lines),
              lines: { create: lines.map((line) => this.toLineData(line)) },
            }),
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
    // Child lines are removed automatically via onDelete: Cascade.
    return this.prisma.reimbursement.delete({ where: { id } });
  }

  private handleError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new ConflictException('Reimbursement already exists');
      }
      // Foreign key violation (an unknown business_id).
      if (error.code === 'P2003') {
        return new BadRequestException('Invalid business reference');
      }
    }
    return error;
  }
}
