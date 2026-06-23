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
import { RecurringService } from './recurring.service';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { FindRecurringQueryDto } from './dto/find-recurring-query.dto';
import { UpdateRecurringDto } from './dto/update-recurring.dto';

@Controller('recurrings')
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) {}

  @Post()
  create(@Body() createRecurringDto: CreateRecurringDto) {
    return this.recurringService.create(createRecurringDto);
  }

  @Get()
  findAll(@Query() query: FindRecurringQueryDto) {
    return this.recurringService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recurringService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecurringDto: UpdateRecurringDto,
  ) {
    return this.recurringService.update(id, updateRecurringDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.recurringService.remove(id);
  }
}
