import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  businessId: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  code: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  name: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  groupId: number;

  @IsOptional()
  @IsIn([1, 2])
  status?: number;
}
