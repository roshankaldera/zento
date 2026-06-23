import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
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

export class CreateBookingDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  businessId: number;

  @IsNotEmpty()
  @IsIn([1, 2])
  category: number;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  roomIds: number[];

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  customer: string;

  @IsNotEmpty()
  @IsDateString()
  fromDate: string;

  @IsNotEmpty()
  @IsDateString()
  toDate: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pax: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  child: number;

  @IsNotEmpty()
  @IsIn([1, 2, 3])
  status: number;

  @IsNotEmpty()
  @IsIn([1, 2])
  segment: number;

  @IsOptional()
  @IsIn([1, 2, 3])
  currency?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  exRate?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  invoiceValue?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  vat?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  sscl?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  grossRevenue?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  commission?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  netRevenue?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  bankCharges?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  finalRevenue?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  tscCommission?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  payout?: number;
}
