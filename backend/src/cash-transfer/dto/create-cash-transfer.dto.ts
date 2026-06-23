import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCashTransferDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  fromBank: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  toBank: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  value: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  postBy: number;

  // 1 = Draft, 2 = Finish, 3 = Canceled. Forced to 2 on create (see service);
  // honoured on update.
  @IsOptional()
  @Type(() => Number)
  @IsIn([1, 2, 3])
  status?: number;
}
