import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateExchangeRateDto {
  @IsNotEmpty()
  @IsIn([2, 3]) // 2 = USD, 3 = EURO
  currencyId: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  rate: number;
}
