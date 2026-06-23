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
import { ReimbursementService } from './reimbursement.service';
import { CreateReimbursementDto } from './dto/create-reimbursement.dto';
import { FindReimbursementQueryDto } from './dto/find-reimbursement-query.dto';
import { UpdateReimbursementDto } from './dto/update-reimbursement.dto';

@Controller('reimbursements')
export class ReimbursementController {
  constructor(private readonly reimbursementService: ReimbursementService) {}

  @Post()
  create(@Body() createReimbursementDto: CreateReimbursementDto) {
    return this.reimbursementService.create(createReimbursementDto);
  }

  @Get()
  findAll(@Query() query: FindReimbursementQueryDto) {
    return this.reimbursementService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reimbursementService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReimbursementDto: UpdateReimbursementDto,
  ) {
    return this.reimbursementService.update(id, updateReimbursementDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reimbursementService.remove(id);
  }
}
