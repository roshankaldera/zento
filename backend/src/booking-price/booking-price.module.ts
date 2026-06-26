import { Module } from '@nestjs/common';
import { BookingPriceController } from './booking-price.controller';
import { BookingPriceService } from './booking-price.service';

@Module({
  controllers: [BookingPriceController],
  providers: [BookingPriceService],
})
export class BookingPriceModule {}
