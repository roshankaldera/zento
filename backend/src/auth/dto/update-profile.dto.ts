import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/** Fields a signed-in user may edit on their own profile. */
export class UpdateProfileDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  remark?: string | null;
}
