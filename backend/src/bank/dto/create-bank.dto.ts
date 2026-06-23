import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateBankDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  businessId: number;

  @IsNotEmpty()
  @IsIn([1, 2])
  type: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  bank: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  branch?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  accountNo?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  cashFloat?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  balance?: number;

  @IsOptional()
  @IsIn([1, 2])
  status?: number;
}
