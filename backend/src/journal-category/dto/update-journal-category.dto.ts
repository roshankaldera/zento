import { PartialType } from '@nestjs/mapped-types';
import { CreateJournalCategoryDto } from './create-journal-category.dto';

export class UpdateJournalCategoryDto extends PartialType(
  CreateJournalCategoryDto,
) {}
