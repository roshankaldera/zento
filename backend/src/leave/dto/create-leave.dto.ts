import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateLeaveDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  employeeId: number;

  @IsNotEmpty()
  @IsIn([1, 2])
  period: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  reason?: string;
}
