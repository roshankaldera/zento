import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateKotIngredientLineDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  item: string;

  @IsOptional()
  @IsIn([1, 2, 3, 4, 5])
  uom?: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  requestQuantity: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  receivedQuantity: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  remark?: string;
}
