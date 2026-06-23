/**
 * Cash Transfer domain types.
 *
 * Mirrors the `cash_transfer` table:
 *   id           int            PK, auto-increment
 *   from_bank    int            required, FK -> bank.id
 *   to_bank      int            required, FK -> bank.id (must differ from from_bank)
 *   date         date           required, default today
 *   value        decimal(18,2)  required
 *   description  varchar(100)   nullable
 *   reference    varchar(100)   nullable
 *   status       tinyint        required, default 1 (1=Draft, 2=Finish, 3=Canceled)
 *   post_by      int            required
 *   post_time    timestamp      required, set at save time
 */

/** 1 = Draft, 2 = Finish, 3 = Canceled. */
export type CashTransferStatus = 1 | 2 | 3

/** A bank reference embedded by the list/detail endpoints. */
export interface CashTransferBankRef {
  id: number
  bank: string
  branch: string | null
}

export interface CashTransfer {
  id: number
  /** Generated transfer number (varchar(15)); assigned server-side on save. */
  cashTransfer: string | null
  fromBank: number
  toBank: number
  date: string
  /** Prisma Decimal serialises to a string. */
  value: string
  description: string | null
  reference: string | null
  status: CashTransferStatus
  postBy: number
  postTime: string
  /** Included by list/detail endpoints. */
  fromBankRef?: CashTransferBankRef
  toBankRef?: CashTransferBankRef
}

/**
 * Payload to create a cash transfer. `status` and `post_time` are set
 * server-side on create (status -> Finish), so `status` here is advisory only.
 */
export interface CreateCashTransferInput {
  fromBank: number
  toBank: number
  date: string
  value: number
  description?: string | null
  reference?: string | null
  postBy: number
  status: CashTransferStatus
}

/** Payload to update an existing cash transfer. */
export type UpdateCashTransferInput = CreateCashTransferInput
