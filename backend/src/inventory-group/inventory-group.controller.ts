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
import { InventoryGroupService } from './inventory-group.service';
import { CreateInventoryGroupDto } from './dto/create-inventory-group.dto';
import { FindInventoryGroupQueryDto } from './dto/find-inventory-group-query.dto';
import { UpdateInventoryGroupDto } from './dto/update-inventory-group.dto';

@Controller('inventory-groups')
export class InventoryGroupController {
  constructor(
    private readonly inventoryGroupService: InventoryGroupService,
  ) {}

  @Post()
  create(@Body() createInventoryGroupDto: CreateInventoryGroupDto) {
    return this.inventoryGroupService.create(createInventoryGroupDto);
  }

  @Get()
  findAll(@Query() query: FindInventoryGroupQueryDto) {
    return this.inventoryGroupService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryGroupService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventoryGroupDto: UpdateInventoryGroupDto,
  ) {
    return this.inventoryGroupService.update(id, updateInventoryGroupDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryGroupService.remove(id);
  }
}
