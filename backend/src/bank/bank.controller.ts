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
import { BankService } from './bank.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { FindBankQueryDto } from './dto/find-bank-query.dto';
import { UpdateBankDto } from './dto/update-bank.dto';

@Controller('banks')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Post()
  create(@Body() createBankDto: CreateBankDto) {
    return this.bankService.create(createBankDto);
  }

  @Get()
  findAll(@Query() query: FindBankQueryDto) {
    return this.bankService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bankService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBankDto: UpdateBankDto,
  ) {
    return this.bankService.update(id, updateBankDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bankService.remove(id);
  }
}
