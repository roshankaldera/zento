import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes, scryptSync } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUserQueryDto } from './dto/find-user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/** Never expose the password hash to API consumers. */
const omitPassword = { password: true } satisfies Prisma.UserOmit;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Basic password encryption: a per-user random salt + scrypt KDF, stored as
   * `salt:hash` (hex). Built-in `crypto`, no external deps; fits VarChar(100).
   */
  private hashPassword(plain: string): string {
    const salt = randomBytes(16).toString('hex');
    const derived = scryptSync(plain, salt, 32).toString('hex');
    return `${salt}:${derived}`;
  }

  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;
    try {
      return await this.prisma.user.create({
        data: { ...rest, password: this.hashPassword(password) },
        omit: omitPassword,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findAll(query: FindUserQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.UserWhereInput = {
      ...(search && {
        OR: [
          { userName: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        omit: omitPassword,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: omitPassword,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    const { password, ...rest } = updateUserDto;
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...rest,
          // Re-hash only when a new password was supplied; blank keeps current.
          ...(password ? { password: this.hashPassword(password) } : {}),
        },
        omit: omitPassword,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id }, omit: omitPassword });
  }

  private handleError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new ConflictException('User user name already exists');
    }
    return error;
  }
}
