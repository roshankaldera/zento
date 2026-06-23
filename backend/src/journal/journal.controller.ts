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
import { JournalService } from './journal.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { FindJournalQueryDto } from './dto/find-journal-query.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';

@Controller('journals')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  create(@Body() createJournalDto: CreateJournalDto) {
    return this.journalService.create(createJournalDto);
  }

  @Get()
  findAll(@Query() query: FindJournalQueryDto) {
    return this.journalService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.journalService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJournalDto: UpdateJournalDto,
  ) {
    return this.journalService.update(id, updateJournalDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.journalService.remove(id);
  }
}
