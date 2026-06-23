import { PartialType } from '@nestjs/mapped-types';
import { CreateLatexHarvestDto } from './create-latex-harvest.dto';

export class UpdateLatexHarvestDto extends PartialType(CreateLatexHarvestDto) {}
