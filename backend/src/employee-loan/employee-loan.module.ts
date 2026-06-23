import { Module } from '@nestjs/common';
import { EmployeeLoanController } from './employee-loan.controller';
import { EmployeeLoanService } from './employee-loan.service';

@Module({
  controllers: [EmployeeLoanController],
  providers: [EmployeeLoanService],
})
export class EmployeeLoanModule {}
