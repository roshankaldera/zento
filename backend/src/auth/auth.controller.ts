import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard, AuthedRequest } from './auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** Return the current user for a valid token (used to hydrate the client). */
  @UseGuards(AuthGuard)
  @Get('me')
  me(@Req() req: AuthedRequest) {
    return this.authService.me(req.user.sub);
  }

  /** Update the signed-in user's own name/remark. */
  @UseGuards(AuthGuard)
  @Patch('profile')
  updateProfile(@Req() req: AuthedRequest, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.sub, dto);
  }

  /** Change the signed-in user's password. */
  @UseGuards(AuthGuard)
  @Patch('password')
  @HttpCode(HttpStatus.OK)
  changePassword(@Req() req: AuthedRequest, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.sub, dto);
  }
}
