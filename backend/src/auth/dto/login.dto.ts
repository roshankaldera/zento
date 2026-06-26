import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  userName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  password: string;

  /** When true, the issued token lives for 30 days instead of 8 hours. */
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
