import { Module } from '@nestjs/common';
import { LatexHarvestController } from './latex-harvest.controller';
import { LatexHarvestService } from './latex-harvest.service';

@Module({
  controllers: [LatexHarvestController],
  providers: [LatexHarvestService],
})
export class LatexHarvestModule {}
