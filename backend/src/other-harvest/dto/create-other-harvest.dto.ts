import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateOtherHarvestDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  estateId: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  supplierId: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  cropId: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  quantity: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  value: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  remark?: string;
}
