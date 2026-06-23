import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateJournalLineDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  accountId: number;

  @IsNotEmpty()
  @IsIn([1, 2]) // 1 = Income, 2 = Expenses
  type: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assetId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  empId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  supplierId?: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  value: number;
}
