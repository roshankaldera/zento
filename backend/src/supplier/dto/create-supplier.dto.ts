import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSupplierDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactPerson?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  contactNo?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  balance?: number;

  @IsOptional()
  @IsIn([1, 2])
  status?: number;
}
