import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class CreateEmployeeLoanDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  employeeId: number;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  value: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  installment: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  balance: number;

  @IsOptional()
  @IsIn([1, 2, 3])
  status?: number;
}
