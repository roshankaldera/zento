import { Module } from '@nestjs/common';
import { AccountCategoryController } from './account-category.controller';
import { AccountCategoryService } from './account-category.service';

@Module({
  controllers: [AccountCategoryController],
  providers: [AccountCategoryService],
})
export class AccountCategoryModule {}
