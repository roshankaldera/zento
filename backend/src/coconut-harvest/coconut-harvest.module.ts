import { Module } from '@nestjs/common';
import { CoconutHarvestController } from './coconut-harvest.controller';
import { CoconutHarvestService } from './coconut-harvest.service';

@Module({
  controllers: [CoconutHarvestController],
  providers: [CoconutHarvestService],
})
export class CoconutHarvestModule {}
