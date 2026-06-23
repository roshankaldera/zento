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
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { FindBudgetQueryDto } from './dto/find-budget-query.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  create(@Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetService.create(createBudgetDto);
  }

  @Get()
  findAll(@Query() query: FindBudgetQueryDto) {
    return this.budgetService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.budgetService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ) {
    return this.budgetService.update(id, updateBudgetDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.budgetService.remove(id);
  }
}
