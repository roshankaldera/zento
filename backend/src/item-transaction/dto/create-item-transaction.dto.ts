import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateItemTransactionLineDto } from './create-item-transaction-line.dto';

/**
 * Create an Item Transaction header together with its lines. The header `total`
 * is NOT accepted from the client — it is recomputed server-side.
 */
export class CreateItemTransactionDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  businessId: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  requestBy?: number;

  @IsNotEmpty()
  @IsIn([1, 2]) // 1 = Receive, 2 = Issue
  type: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  remark?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateItemTransactionLineDto)
  lines: CreateItemTransactionLineDto[];
}
