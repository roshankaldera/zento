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
import { ExchangeRateService } from './exchange-rate.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { FindExchangeRateQueryDto } from './dto/find-exchange-rate-query.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';

@Controller('exchange-rates')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Post()
  create(@Body() createExchangeRateDto: CreateExchangeRateDto) {
    return this.exchangeRateService.create(createExchangeRateDto);
  }

  @Get()
  findAll(@Query() query: FindExchangeRateQueryDto) {
    return this.exchangeRateService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exchangeRateService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExchangeRateDto: UpdateExchangeRateDto,
  ) {
    return this.exchangeRateService.update(id, updateExchangeRateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.exchangeRateService.remove(id);
  }
}
