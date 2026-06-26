import { Module } from '@nestjs/common';
import { OtherHarvestController } from './other-harvest.controller';
import { OtherHarvestService } from './other-harvest.service';

@Module({
  controllers: [OtherHarvestController],
  providers: [OtherHarvestService],
})
export class OtherHarvestModule {}
