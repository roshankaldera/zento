import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountModule } from './account/account.module';
import { AccountCategoryModule } from './account-category/account-category.module';
import { AssetModule } from './asset/asset.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthModule } from './auth/auth.module';
import { BankModule } from './bank/bank.module';
import { BookingModule } from './booking/booking.module';
import { BookingPriceModule } from './booking-price/booking-price.module';
import { BudgetModule } from './budget/budget.module';
import { BusinessModule } from './business/business.module';
import { CashTransferModule } from './cash-transfer/cash-transfer.module';
import { CoconutHarvestModule } from './coconut-harvest/coconut-harvest.module';
import { CropModule } from './crop/crop.module';
import { EmployeeModule } from './employee/employee.module';
import { EmployeeLoanModule } from './employee-loan/employee-loan.module';
import { ExchangeRateModule } from './exchange-rate/exchange-rate.module';
import { FleetModule } from './fleet/fleet.module';
import { InventoryModule } from './inventory/inventory.module';
import { InventoryGroupModule } from './inventory-group/inventory-group.module';
import { ItemTransactionModule } from './item-transaction/item-transaction.module';
import { JournalModule } from './journal/journal.module';
import { JournalCategoryModule } from './journal-category/journal-category.module';
import { KotModule } from './kot/kot.module';
import { KotIngredientModule } from './kot-ingredient/kot-ingredient.module';
import { LatexHarvestModule } from './latex-harvest/latex-harvest.module';
import { LeaveModule } from './leave/leave.module';
import { OtherHarvestModule } from './other-harvest/other-harvest.module';
import { RecurringModule } from './recurring/recurring.module';
import { ReimbursementModule } from './reimbursement/reimbursement.module';
import { ReportsModule } from './reports/reports.module';
import { RentModule } from './rent/rent.module';
import { SoloarModule } from './soloar/soloar.module';
import { SupplierModule } from './supplier/supplier.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { NumberingModule } from './numbering/numbering.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    NumberingModule,
    CropModule,
    AccountModule,
    AccountCategoryModule,
    JournalCategoryModule,
    InventoryGroupModule,
    BusinessModule,
    EmployeeModule,
    BankModule,
    AttendanceModule,
    LeaveModule,
    EmployeeLoanModule,
    BookingModule,
    BookingPriceModule,
    KotModule,
    KotIngredientModule,
    CoconutHarvestModule,
    LatexHarvestModule,
    OtherHarvestModule,
    SupplierModule,
    AssetModule,
    FleetModule,
    RentModule,
    SoloarModule,
    UserModule,
    ExchangeRateModule,
    InventoryModule,
    ItemTransactionModule,
    CashTransferModule,
    BudgetModule,
    ReimbursementModule,
    JournalModule,
    RecurringModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
