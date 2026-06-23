import { PartialType } from '@nestjs/mapped-types';
import { CreateInventoryGroupDto } from './create-inventory-group.dto';

export class UpdateInventoryGroupDto extends PartialType(
  CreateInventoryGroupDto,
) {}
