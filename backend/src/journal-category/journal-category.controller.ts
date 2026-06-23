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
import { JournalCategoryService } from './journal-category.service';
import { CreateJournalCategoryDto } from './dto/create-journal-category.dto';
import { FindJournalCategoryQueryDto } from './dto/find-journal-category-query.dto';
import { UpdateJournalCategoryDto } from './dto/update-journal-category.dto';

@Controller('journal-categories')
export class JournalCategoryController {
  constructor(
    private readonly journalCategoryService: JournalCategoryService,
  ) {}

  @Post()
  create(@Body() createJournalCategoryDto: CreateJournalCategoryDto) {
    return this.journalCategoryService.create(createJournalCategoryDto);
  }

  @Get()
  findAll(@Query() query: FindJournalCategoryQueryDto) {
    return this.journalCategoryService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.journalCategoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJournalCategoryDto: UpdateJournalCategoryDto,
  ) {
    return this.journalCategoryService.update(id, updateJournalCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.journalCategoryService.remove(id);
  }
}
