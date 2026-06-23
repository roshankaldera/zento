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
import { ItemTransactionService } from './item-transaction.service';
import { CreateItemTransactionDto } from './dto/create-item-transaction.dto';
import { FindItemTransactionQueryDto } from './dto/find-item-transaction-query.dto';
import { UpdateItemTransactionDto } from './dto/update-item-transaction.dto';

@Controller('item-transactions')
export class ItemTransactionController {
  constructor(
    private readonly itemTransactionService: ItemTransactionService,
  ) {}

  @Post()
  create(@Body() createItemTransactionDto: CreateItemTransactionDto) {
    return this.itemTransactionService.create(createItemTransactionDto);
  }

  @Get()
  findAll(@Query() query: FindItemTransactionQueryDto) {
    return this.itemTransactionService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemTransactionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemTransactionDto: UpdateItemTransactionDto,
  ) {
    return this.itemTransactionService.update(id, updateItemTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemTransactionService.remove(id);
  }
}
