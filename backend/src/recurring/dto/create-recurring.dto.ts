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
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateRecurringLineDto } from './create-recurring-line.dto';

export class CreateRecurringDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  businessId: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  bankId: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  category: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  recurringDay: number;

  @IsOptional()
  @IsDateString()
  fromPeriod?: string;

  @IsOptional()
  @IsDateString()
  toPeriod?: string;

  @IsOptional()
  @Type(() => Number)
  @IsIn([1, 2]) // 1 = Active, 2 = Inactive
  status?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  remark?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateRecurringLineDto)
  lines: CreateRecurringLineDto[];
}
