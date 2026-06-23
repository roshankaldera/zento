import { Module } from '@nestjs/common';
import { KotIngredientController } from './kot-ingredient.controller';
import { KotIngredientService } from './kot-ingredient.service';

@Module({
  controllers: [KotIngredientController],
  providers: [KotIngredientService],
})
export class KotIngredientModule {}
