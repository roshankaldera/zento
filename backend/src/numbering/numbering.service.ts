import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Document-number prefixes — the primary key of each `numbering` row. Passed to
 * {@link NumberingService.next} so every module reserves from its own sequence.
 */
export const NumberPrefix = {
  Journal: 'JNL',
  CashTransfer: 'CTR',
  Reimbursement: 'RMB',
  Booking: 'BKN',
} as const;

/** Width the running number is zero-padded to (e.g. 1 -> "000001"). */
const NUMBER_WIDTH = 6;

@Injectable()
export class NumberingService {
  /**
   * Reserve the next document number for `prefix` inside an open transaction.
   *
   * Reads the sequence row's `current_no`, returns it formatted as
   * `<prefix><current_no zero-padded to 6>` (e.g. `JNL000001`), then increments
   * `current_no` by one. The increment+read is a single atomic UPDATE that
   * row-locks the sequence for the rest of the transaction, so concurrent saves
   * can never be handed the same number.
   *
   * MUST be called with the `tx` client from a `$transaction`, so the number is
   * only consumed if the entity it belongs to is committed.
   */
  async next(tx: Prisma.TransactionClient, prefix: string): Promise<string> {
    const row = await tx.numbering.update({
      where: { prefix },
      data: { currentNo: { increment: 1 } },
    });
    // `row.currentNo` is already incremented, so the number we issue is the
    // value that was current before this call.
    const issued = row.currentNo - 1;
    return `${row.prefix}${String(issued).padStart(NUMBER_WIDTH, '0')}`;
  }
}
