import { PartialType } from '@nestjs/mapped-types';
import { CreateCashTransferDto } from './create-cash-transfer.dto';

export class UpdateCashTransferDto extends PartialType(CreateCashTransferDto) {}
