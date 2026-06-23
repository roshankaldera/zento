import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateKotLineDto } from './create-kot-line.dto';

export class CreateKotDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  businessId: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  bookingId: number;

  @IsNotEmpty()
  @IsDateString()
  requestTime: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateKotLineDto)
  lines: CreateKotLineDto[];
}
