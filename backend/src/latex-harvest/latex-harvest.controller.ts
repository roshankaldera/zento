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
import { LatexHarvestService } from './latex-harvest.service';
import { CreateLatexHarvestDto } from './dto/create-latex-harvest.dto';
import { FindLatexHarvestQueryDto } from './dto/find-latex-harvest-query.dto';
import { UpdateLatexHarvestDto } from './dto/update-latex-harvest.dto';

@Controller('latex-harvests')
export class LatexHarvestController {
  constructor(private readonly latexHarvestService: LatexHarvestService) {}

  @Post()
  create(@Body() createLatexHarvestDto: CreateLatexHarvestDto) {
    return this.latexHarvestService.create(createLatexHarvestDto);
  }

  @Get()
  findAll(@Query() query: FindLatexHarvestQueryDto) {
    return this.latexHarvestService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.latexHarvestService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLatexHarvestDto: UpdateLatexHarvestDto,
  ) {
    return this.latexHarvestService.update(id, updateLatexHarvestDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.latexHarvestService.remove(id);
  }
}
