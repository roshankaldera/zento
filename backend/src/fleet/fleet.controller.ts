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
import { FleetService } from './fleet.service';
import { CreateFleetDto } from './dto/create-fleet.dto';
import { FindFleetQueryDto } from './dto/find-fleet-query.dto';
import { UpdateFleetDto } from './dto/update-fleet.dto';

@Controller('fleets')
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  @Post()
  create(@Body() createFleetDto: CreateFleetDto) {
    return this.fleetService.create(createFleetDto);
  }

  @Get()
  findAll(@Query() query: FindFleetQueryDto) {
    return this.fleetService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fleetService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFleetDto: UpdateFleetDto,
  ) {
    return this.fleetService.update(id, updateFleetDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fleetService.remove(id);
  }
}
