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
import { CreateCoconutDivisionLineDto } from './create-coconut-division-line.dto';

export class CreateCoconutHarvestDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  estateId: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  remark?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateCoconutDivisionLineDto)
  lines: CreateCoconutDivisionLineDto[];
}
