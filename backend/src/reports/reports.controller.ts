import { Controller, Get } from '@nestjs/common';
import { CashFlowReportRow, ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('cash-flow')
  cashFlow(): Promise<CashFlowReportRow[]> {
    return this.reportsService.cashFlow();
  }
}
