import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  userName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(100)
  password: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  defaultBusiness?: number | null;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  accessibleBusinesses: number[];

  @IsOptional()
  @IsIn([1, 2])
  status?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  remark?: string;
}
