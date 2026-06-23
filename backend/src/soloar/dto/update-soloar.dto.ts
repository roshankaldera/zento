import { PartialType } from '@nestjs/mapped-types';
import { CreateSoloarDto } from './create-soloar.dto';

export class UpdateSoloarDto extends PartialType(CreateSoloarDto) {}
