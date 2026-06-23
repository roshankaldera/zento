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
import { EmployeeLoanService } from './employee-loan.service';
import { CreateEmployeeLoanDto } from './dto/create-employee-loan.dto';
import { FindEmployeeLoanQueryDto } from './dto/find-employee-loan-query.dto';
import { UpdateEmployeeLoanDto } from './dto/update-employee-loan.dto';

@Controller('employee-loans')
export class EmployeeLoanController {
  constructor(private readonly employeeLoanService: EmployeeLoanService) {}

  @Post()
  create(@Body() createEmployeeLoanDto: CreateEmployeeLoanDto) {
    return this.employeeLoanService.create(createEmployeeLoanDto);
  }

  @Get()
  findAll(@Query() query: FindEmployeeLoanQueryDto) {
    return this.employeeLoanService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeeLoanService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeLoanDto: UpdateEmployeeLoanDto,
  ) {
    return this.employeeLoanService.update(id, updateEmployeeLoanDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.employeeLoanService.remove(id);
  }
}
