import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateInventoryStockDto } from './create-inventory-stock.dto';

export class CreateInventoryDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  applicableBusinesses: number[];

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsIn([1, 2, 3, 4, 5])
  uom?: number;

  @IsOptional()
  @IsIn([1, 2])
  status?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInventoryStockDto)
  lines: CreateInventoryStockDto[];
}
