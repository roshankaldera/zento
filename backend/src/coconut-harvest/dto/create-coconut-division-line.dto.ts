import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateCoconutDivisionLineDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  divisionId: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity: number;
}
