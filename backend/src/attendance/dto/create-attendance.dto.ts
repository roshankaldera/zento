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
import { CreateAttendanceLineDto } from './create-attendance-line.dto';

export class CreateAttendanceDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  businessId: number;

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
  @Type(() => CreateAttendanceLineDto)
  lines: CreateAttendanceLineDto[];
}
