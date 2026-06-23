import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateBusinessLineDto } from './create-business-line.dto';

export class CreateBusinessDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsIn([1, 2, 3, 4])
  type: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactPerson?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  remark?: string;

  @IsOptional()
  @IsIn([1, 2])
  status?: number;

  /** Divisions — persisted only when `type` is 1 (Estate). */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBusinessLineDto)
  estateDivisions?: CreateBusinessLineDto[];

  /** Rooms — persisted only when `type` is 2 (Villa). */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBusinessLineDto)
  villaRooms?: CreateBusinessLineDto[];
}
