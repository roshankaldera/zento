import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateKotLineDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  item: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  remark?: string;
}
