import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { KotIngredientService } from './kot-ingredient.service';
import { CreateKotIngredientDto } from './dto/create-kot-ingredient.dto';
import { FindKotIngredientQueryDto } from './dto/find-kot-ingredient-query.dto';
import { UpdateKotIngredientDto } from './dto/update-kot-ingredient.dto';

@Controller('kot-ingredients')
export class KotIngredientController {
  constructor(private readonly kotIngredientService: KotIngredientService) {}

  @Post()
  create(@Body() createKotIngredientDto: CreateKotIngredientDto) {
    return this.kotIngredientService.create(createKotIngredientDto);
  }

  @Get()
  findAll(@Query() query: FindKotIngredientQueryDto) {
    return this.kotIngredientService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.kotIngredientService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateKotIngredientDto: UpdateKotIngredientDto,
  ) {
    return this.kotIngredientService.update(id, updateKotIngredientDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.kotIngredientService.remove(id);
  }
}
