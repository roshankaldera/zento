import { PartialType } from '@nestjs/mapped-types';
import { CreateItemTransactionDto } from './create-item-transaction.dto';

export class UpdateItemTransactionDto extends PartialType(
  CreateItemTransactionDto,
) {}
