import { Module } from '@nestjs/common';
import { SoloarController } from './soloar.controller';
import { SoloarService } from './soloar.service';

@Module({
  controllers: [SoloarController],
  providers: [SoloarService],
})
export class SoloarModule {}
