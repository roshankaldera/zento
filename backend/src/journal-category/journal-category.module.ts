import { Module } from '@nestjs/common';
import { JournalCategoryController } from './journal-category.controller';
import { JournalCategoryService } from './journal-category.service';

@Module({
  controllers: [JournalCategoryController],
  providers: [JournalCategoryService],
})
export class JournalCategoryModule {}
