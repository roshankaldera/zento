import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * One budget line. The 12 month amounts are optional in the payload — an
 * omitted month falls back to the column default of 0.
 */
export class CreateBudgetLineDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  accountId: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  january?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  february?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  march?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  april?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  may?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  june?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  july?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  august?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  september?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  october?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  november?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  december?: number;
}
