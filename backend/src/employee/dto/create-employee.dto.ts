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

export class CreateEmployeeDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  businessId: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  empNo: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(12)
  nic: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  mobile1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  mobile2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  address?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsNotEmpty()
  @IsIn([1, 2])
  attendType: number;

  @IsOptional()
  @IsIn([1, 2])
  status?: number;
}
