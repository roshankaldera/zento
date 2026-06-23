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
import { SoloarService } from './soloar.service';
import { CreateSoloarDto } from './dto/create-soloar.dto';
import { FindSoloarQueryDto } from './dto/find-soloar-query.dto';
import { UpdateSoloarDto } from './dto/update-soloar.dto';

@Controller('soloars')
export class SoloarController {
  constructor(private readonly soloarService: SoloarService) {}

  @Post()
  create(@Body() createSoloarDto: CreateSoloarDto) {
    return this.soloarService.create(createSoloarDto);
  }

  @Get()
  findAll(@Query() query: FindSoloarQueryDto) {
    return this.soloarService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.soloarService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSoloarDto: UpdateSoloarDto,
  ) {
    return this.soloarService.update(id, updateSoloarDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.soloarService.remove(id);
  }
}
