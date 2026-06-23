import { Global, Module } from '@nestjs/common';
import { NumberingService } from './numbering.service';

/** Global so any feature module can inject NumberingService (like PrismaModule). */
@Global()
@Module({
  providers: [NumberingService],
  exports: [NumberingService],
})
export class NumberingModule {}
