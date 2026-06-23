import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAttendanceLineDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  employeeId: number;

  @IsNotEmpty()
  @IsIn([1, 2, 3])
  shift: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(24)
  hours: number;

  @IsNotEmpty()
  @IsIn([1, 2, 3, 4])
  status: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  remark?: string;
}
