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
import { CropService } from './crop.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { FindCropQueryDto } from './dto/find-crop-query.dto';
import { UpdateCropDto } from './dto/update-crop.dto';

@Controller('crops')
export class CropController {
  constructor(private readonly cropService: CropService) {}

  @Post()
  create(@Body() createCropDto: CreateCropDto) {
    return this.cropService.create(createCropDto);
  }

  @Get()
  findAll(@Query() query: FindCropQueryDto) {
    return this.cropService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cropService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCropDto: UpdateCropDto,
  ) {
    return this.cropService.update(id, updateCropDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cropService.remove(id);
  }
}
