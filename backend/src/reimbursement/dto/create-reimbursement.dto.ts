import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateReimbursementLineDto } from './create-reimbursement-line.dto';

/**
 * Create a Reimbursement header together with its lines. `total_value` and
 * `post_time` are NOT accepted from the client — they are computed/stamped
 * server-side. `status` is forced to 2 (Finish) on create (see service).
 */
export class CreateReimbursementDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  businessId: number;

  // Generated server-side on save (see NumberingService); ignored if sent.
  @IsOptional()
  @IsString()
  @MaxLength(20)
  reimbursementNo?: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  remark?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  postBy: number;

  @IsOptional()
  @Type(() => Number)
  @IsIn([1, 2, 3]) // 1 = Draft, 2 = Finish, 3 = Canceled
  status?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateReimbursementLineDto)
  lines: CreateReimbursementLineDto[];
}
