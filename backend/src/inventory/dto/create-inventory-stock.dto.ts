import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateInventoryStockDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  businessId: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  avgCost?: number;
}
