import { Module } from '@nestjs/common';
import { InventoryGroupController } from './inventory-group.controller';
import { InventoryGroupService } from './inventory-group.service';

@Module({
  controllers: [InventoryGroupController],
  providers: [InventoryGroupService],
})
export class InventoryGroupModule {}
