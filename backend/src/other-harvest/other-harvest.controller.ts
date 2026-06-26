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
import { OtherHarvestService } from './other-harvest.service';
import { CreateOtherHarvestDto } from './dto/create-other-harvest.dto';
import { FindOtherHarvestQueryDto } from './dto/find-other-harvest-query.dto';
import { UpdateOtherHarvestDto } from './dto/update-other-harvest.dto';

@Controller('other-harvests')
export class OtherHarvestController {
  constructor(private readonly otherHarvestService: OtherHarvestService) {}

  @Post()
  create(@Body() createOtherHarvestDto: CreateOtherHarvestDto) {
    return this.otherHarvestService.create(createOtherHarvestDto);
  }

  @Get()
  findAll(@Query() query: FindOtherHarvestQueryDto) {
    return this.otherHarvestService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.otherHarvestService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOtherHarvestDto: UpdateOtherHarvestDto,
  ) {
    return this.otherHarvestService.update(id, updateOtherHarvestDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.otherHarvestService.remove(id);
  }
}
