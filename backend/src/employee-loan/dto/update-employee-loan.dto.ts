import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeLoanDto } from './create-employee-loan.dto';

export class UpdateEmployeeLoanDto extends PartialType(CreateEmployeeLoanDto) {}
