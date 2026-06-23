/**
 * Bank master domain types.
 *
 * Mirrors the `bank` table:
 *   id           int            PK, auto-increment
 *   business_id  int            required, FK -> business.id
 *   type         tinyint        required (1=Bank, 2=Petty Cash)
 *   bank         varchar(20)    required (bank name or person name)
 *   branch       varchar(20)    nullable
 *   account_no   varchar(20)    nullable
 *   cash_float   decimal(18,2)  required, default 0
 *   balance      decimal(18,2)  required, default 0
 *   status       tinyint        required, default 1 (1=Active, 2=Inactive)
 */

/** 1 = Bank, 2 = Petty Cash. */
export type BankType = 1 | 2

/** 1 = Active, 2 = Inactive. */
export type BankStatus = 1 | 2

export interface Bank {
  id: number
  businessId: number
  type: BankType
  bank: string
  branch: string | null
  accountNo: string | null
  /** Prisma Decimal serialises to a string. */
  cashFloat: string
  balance: string
  status: BankStatus
  /** Included by list/detail endpoints. */
  business?: { id: number; name: string }
}

/** Payload to create a bank (server assigns `id`). */
export interface CreateBankInput {
  businessId: number
  type: BankType
  bank: string
  branch?: string | null
  accountNo?: string | null
  cashFloat: number
  balance: number
  status: BankStatus
}

/** Payload to update an existing bank. */
export type UpdateBankInput = CreateBankInput
