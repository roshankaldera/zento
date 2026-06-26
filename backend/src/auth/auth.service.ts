import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { signToken, TokenPayload, verifyToken } from './token.util';

/** Never expose the password hash to API consumers. */
const omitPassword = { password: true } satisfies Prisma.UserOmit;

const EIGHT_HOURS = 60 * 60 * 8;
const THIRTY_DAYS = 60 * 60 * 24 * 30;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private get secret(): string {
    return this.config.get<string>('AUTH_SECRET', 'zento-dev-secret-change-me');
  }

  /**
   * Verify a plain password against the stored `salt:hash` produced by
   * UserService.hashPassword (scrypt, 32-byte key). Constant-time compare.
   */
  private verifyPassword(plain: string, stored: string): boolean {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const derived = scryptSync(plain, salt, 32);
    const expected = Buffer.from(hash, 'hex');
    return (
      expected.length === derived.length && timingSafeEqual(expected, derived)
    );
  }

  /**
   * Hash a plain password as `salt:hash` (scrypt, 32-byte key) — the same
   * format UserService stores and verifyPassword reads.
   */
  private hashPassword(plain: string): string {
    const salt = randomBytes(16).toString('hex');
    const derived = scryptSync(plain, salt, 32).toString('hex');
    return `${salt}:${derived}`;
  }

  /** Validate credentials and issue a signed token plus the sanitized user. */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { userName: dto.userName },
    });

    // Same error whether the user is missing or the password is wrong, so the
    // response doesn't reveal which user names exist.
    if (!user || !this.verifyPassword(dto.password, user.password)) {
      throw new UnauthorizedException('Invalid user name or password');
    }
    if (user.status !== 1) {
      throw new UnauthorizedException('This account is inactive');
    }

    const expiresIn = dto.rememberMe ? THIRTY_DAYS : EIGHT_HOURS;
    const exp = Math.floor(Date.now() / 1000) + expiresIn;
    const accessToken = signToken(
      { sub: user.id, userName: user.userName, exp },
      this.secret,
    );

    const safeUser = { ...user, password: undefined };
    return { accessToken, expiresIn, user: safeUser };
  }

  /** Decode/verify a bearer token; throws when invalid or expired. */
  verify(token: string): TokenPayload {
    const payload = verifyToken(token, this.secret);
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return payload;
  }

  /** Resolve the current user for a verified token id. */
  async me(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      omit: omitPassword,
    });
    if (!user) {
      throw new UnauthorizedException('Account no longer exists');
    }
    return user;
  }

  /** Update the signed-in user's own name/remark. */
  async updateProfile(userId: number, dto: UpdateProfileDto) {
    await this.me(userId); // 401 if the account no longer exists
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        remark: dto.remark?.trim() ? dto.remark.trim() : null,
      },
      omit: omitPassword,
    });
  }

  /** Change the signed-in user's password after verifying the current one. */
  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Account no longer exists');
    }
    if (!this.verifyPassword(dto.currentPassword, user.password)) {
      throw new BadRequestException('Current password is incorrect');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: this.hashPassword(dto.newPassword) },
    });
    return { success: true };
  }
}
