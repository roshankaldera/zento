import { PartialType } from '@nestjs/mapped-types';
import { CreateCoconutHarvestDto } from './create-coconut-harvest.dto';

export class UpdateCoconutHarvestDto extends PartialType(
  CreateCoconutHarvestDto,
) {}
