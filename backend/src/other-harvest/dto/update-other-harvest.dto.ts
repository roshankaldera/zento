import { PartialType } from '@nestjs/mapped-types';
import { CreateOtherHarvestDto } from './create-other-harvest.dto';

export class UpdateOtherHarvestDto extends PartialType(CreateOtherHarvestDto) {}
