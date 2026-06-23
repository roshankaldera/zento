import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateLatexLineDto } from './create-latex-line.dto';

export class CreateLatexHarvestDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  estateId: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  rainfall?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  remark?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateLatexLineDto)
  lines: CreateLatexLineDto[];
}
