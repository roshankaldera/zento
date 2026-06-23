import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateLatexLineDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  employeeId: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  liter: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  ottapalu: number;

  @IsNotEmpty()
  @IsIn([1, 2, 3, 4, 5])
  status: number;
}
