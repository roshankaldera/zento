import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateSoloarDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  soloarId: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  meterReading: number;
}
