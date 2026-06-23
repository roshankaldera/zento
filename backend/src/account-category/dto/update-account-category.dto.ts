import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountCategoryDto } from './create-account-category.dto';

export class UpdateAccountCategoryDto extends PartialType(
  CreateAccountCategoryDto,
) {}
