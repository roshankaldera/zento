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
import { CoconutHarvestService } from './coconut-harvest.service';
import { CreateCoconutHarvestDto } from './dto/create-coconut-harvest.dto';
import { FindCoconutHarvestQueryDto } from './dto/find-coconut-harvest-query.dto';
import { UpdateCoconutHarvestDto } from './dto/update-coconut-harvest.dto';

@Controller('coconut-harvests')
export class CoconutHarvestController {
  constructor(
    private readonly coconutHarvestService: CoconutHarvestService,
  ) {}

  @Post()
  create(@Body() createCoconutHarvestDto: CreateCoconutHarvestDto) {
    return this.coconutHarvestService.create(createCoconutHarvestDto);
  }

  @Get()
  findAll(@Query() query: FindCoconutHarvestQueryDto) {
    return this.coconutHarvestService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coconutHarvestService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCoconutHarvestDto: UpdateCoconutHarvestDto,
  ) {
    return this.coconutHarvestService.update(id, updateCoconutHarvestDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coconutHarvestService.remove(id);
  }
}
