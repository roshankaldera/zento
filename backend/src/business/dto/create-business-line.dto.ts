import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * A single Estate Division / Villa Room line. Both child tables share this exact
 * shape (name + remark + status); the parent `type` decides which table is used.
 */
export class CreateBusinessLineDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  remark?: string;

  @IsOptional()
  @IsIn([1, 2])
  status?: number;
}
