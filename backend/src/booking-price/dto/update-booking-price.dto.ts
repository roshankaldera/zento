import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingPriceDto } from './create-booking-price.dto';

export class UpdateBookingPriceDto extends PartialType(CreateBookingPriceDto) {}
