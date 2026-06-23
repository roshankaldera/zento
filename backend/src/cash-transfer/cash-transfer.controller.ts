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
import { CashTransferService } from './cash-transfer.service';
import { CreateCashTransferDto } from './dto/create-cash-transfer.dto';
import { FindCashTransferQueryDto } from './dto/find-cash-transfer-query.dto';
import { UpdateCashTransferDto } from './dto/update-cash-transfer.dto';

@Controller('cash-transfers')
export class CashTransferController {
  constructor(private readonly cashTransferService: CashTransferService) {}

  @Post()
  create(@Body() createCashTransferDto: CreateCashTransferDto) {
    return this.cashTransferService.create(createCashTransferDto);
  }

  @Get()
  findAll(@Query() query: FindCashTransferQueryDto) {
    return this.cashTransferService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cashTransferService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCashTransferDto: UpdateCashTransferDto,
  ) {
    return this.cashTransferService.update(id, updateCashTransferDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cashTransferService.remove(id);
  }
}
