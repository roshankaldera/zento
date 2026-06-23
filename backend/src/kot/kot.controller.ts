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
import { KotService } from './kot.service';
import { CreateKotDto } from './dto/create-kot.dto';
import { FindKotQueryDto } from './dto/find-kot-query.dto';
import { UpdateKotDto } from './dto/update-kot.dto';

@Controller('kots')
export class KotController {
  constructor(private readonly kotService: KotService) {}

  @Post()
  create(@Body() createKotDto: CreateKotDto) {
    return this.kotService.create(createKotDto);
  }

  @Get()
  findAll(@Query() query: FindKotQueryDto) {
    return this.kotService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.kotService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateKotDto: UpdateKotDto,
  ) {
    return this.kotService.update(id, updateKotDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.kotService.remove(id);
  }
}
