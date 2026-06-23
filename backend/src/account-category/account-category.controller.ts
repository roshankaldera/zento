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
import { AccountCategoryService } from './account-category.service';
import { CreateAccountCategoryDto } from './dto/create-account-category.dto';
import { FindAccountCategoryQueryDto } from './dto/find-account-category-query.dto';
import { UpdateAccountCategoryDto } from './dto/update-account-category.dto';

@Controller('account-categories')
export class AccountCategoryController {
  constructor(
    private readonly accountCategoryService: AccountCategoryService,
  ) {}

  @Post()
  create(@Body() createAccountCategoryDto: CreateAccountCategoryDto) {
    return this.accountCategoryService.create(createAccountCategoryDto);
  }

  @Get()
  findAll(@Query() query: FindAccountCategoryQueryDto) {
    return this.accountCategoryService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.accountCategoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountCategoryDto: UpdateAccountCategoryDto,
  ) {
    return this.accountCategoryService.update(id, updateAccountCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.accountCategoryService.remove(id);
  }
}
