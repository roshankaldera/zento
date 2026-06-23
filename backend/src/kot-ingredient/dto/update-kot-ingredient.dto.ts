import { PartialType } from '@nestjs/mapped-types';
import { CreateKotIngredientDto } from './create-kot-ingredient.dto';

export class UpdateKotIngredientDto extends PartialType(CreateKotIngredientDto) {}
