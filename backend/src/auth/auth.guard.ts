import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { TokenPayload } from './token.util';

/** Request augmented with the verified token payload. */
export interface AuthedRequest extends Request {
  user: TokenPayload;
}

/** Requires a valid `Authorization: Bearer <token>` header. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    request.user = this.authService.verify(header.slice('Bearer '.length));
    return true;
  }
}
