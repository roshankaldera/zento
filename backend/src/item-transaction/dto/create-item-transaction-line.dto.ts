import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * One transaction line. `total` is NOT accepted from the client — it is a
 * computed column recomputed server-side (quantity * price).
 */
export class CreateItemTransactionLineDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  itemId: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  description?: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  quantity: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;
}
