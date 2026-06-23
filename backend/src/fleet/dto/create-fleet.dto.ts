import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

/** mm/dd — month 01-12, day 01-31 (recurring renewal day, no year). */
const MM_DD = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/;

export class CreateFleetDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  vehicleNo: string;

  @IsNotEmpty()
  @IsString()
  @Matches(MM_DD, { message: 'licenseDate must be in mm/dd format' })
  licenseDate: string;

  @IsNotEmpty()
  @IsString()
  @Matches(MM_DD, { message: 'insuranceDate must be in mm/dd format' })
  insuranceDate: string;

  @IsOptional()
  @IsIn([1, 2])
  status?: number;
}
