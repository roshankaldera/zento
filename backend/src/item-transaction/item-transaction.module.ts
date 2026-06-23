import { Module } from '@nestjs/common';
import { ItemTransactionController } from './item-transaction.controller';
import { ItemTransactionService } from './item-transaction.service';

@Module({
  controllers: [ItemTransactionController],
  providers: [ItemTransactionService],
})
export class ItemTransactionModule {}
