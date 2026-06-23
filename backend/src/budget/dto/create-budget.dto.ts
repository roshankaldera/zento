import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateBudgetLineDto } from './create-budget-line.dto';

export class CreateBudgetDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  businessId: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(9999)
  year: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetLineDto)
  lines: CreateBudgetLineDto[];
}
