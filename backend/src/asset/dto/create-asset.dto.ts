import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAssetDto {
  @IsNotEmpty()
  @IsInt()
  businessId: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsIn([1, 2, 3, 4])
  type: number;

  @IsOptional()
  @IsIn([1, 2])
  status?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  remark?: string;
}
