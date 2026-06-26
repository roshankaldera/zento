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
import { BookingPriceService } from './booking-price.service';
import { CreateBookingPriceDto } from './dto/create-booking-price.dto';
import { FindBookingPriceQueryDto } from './dto/find-booking-price-query.dto';
import { UpdateBookingPriceDto } from './dto/update-booking-price.dto';

@Controller('booking-price-lists')
export class BookingPriceController {
  constructor(private readonly bookingPriceService: BookingPriceService) {}

  @Post()
  create(@Body() createBookingPriceDto: CreateBookingPriceDto) {
    return this.bookingPriceService.create(createBookingPriceDto);
  }

  @Get()
  findAll(@Query() query: FindBookingPriceQueryDto) {
    return this.bookingPriceService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingPriceService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookingPriceDto: UpdateBookingPriceDto,
  ) {
    return this.bookingPriceService.update(id, updateBookingPriceDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookingPriceService.remove(id);
  }
}
