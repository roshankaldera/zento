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
import { RentService } from './rent.service';
import { CreateRentDto } from './dto/create-rent.dto';
import { FindRentQueryDto } from './dto/find-rent-query.dto';
import { UpdateRentDto } from './dto/update-rent.dto';

@Controller('rents')
export class RentController {
  constructor(private readonly rentService: RentService) {}

  @Post()
  create(@Body() createRentDto: CreateRentDto) {
    return this.rentService.create(createRentDto);
  }

  @Get()
  findAll(@Query() query: FindRentQueryDto) {
    return this.rentService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rentService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRentDto: UpdateRentDto,
  ) {
    return this.rentService.update(id, updateRentDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rentService.remove(id);
  }
}
