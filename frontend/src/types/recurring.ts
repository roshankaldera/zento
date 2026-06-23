/**
 * Recurring (master) + Recurring Line (detail) domain types.
 *
 * Mirrors the `recurring` / `recurring_line` tables. There are no computed or
 * audit columns; `status` is a normal Active/Inactive flag.
 */

/** 1 = Active, 2 = Inactive. */
export type RecurringStatus = 1 | 2

/** 1 = Income, 2 = Expenses. */
export type RecurringLineType = 1 | 2

export interface RecurringLine {
  id: number
  mainId: number
  accountId: number
  type: RecurringLineType
  description: string | null
  reference: string | null
  assetId: number | null
  empId: number | null
  supplierId: number | null
  /** Decimals serialized as strings by Prisma. */
  value: number
}

export interface Recurring {
  id: number
  businessId: number
  bankId: number
  category: number
  recurringDay: number
  fromPeriod: string | null
  toPeriod: string | null
  status: RecurringStatus
  remark: string | null
  business?: { id: number; name: string }
  bank?: { id: number; bank: string }
  journalCategory?: { id: number; name: string }
  /** Present on detail (findOne) responses. */
  lines?: RecurringLine[]
  /** Present on list (findAll) responses. */
  _count?: { lines: number }
}

/** A single line in the create/update payload (server assigns id + main_id). */
export interface CreateRecurringLineInput {
  accountId: number
  type: RecurringLineType
  description?: string | null
  reference?: string | null
  assetId?: number | null
  empId?: number | null
  supplierId?: number | null
  value: number
}

/** Payload to create a recurring header together with its lines. */
export interface CreateRecurringInput {
  businessId: number
  bankId: number
  category: number
  recurringDay: number
  fromPeriod?: string | null
  toPeriod?: string | null
  status: RecurringStatus
  remark?: string | null
  lines: CreateRecurringLineInput[]
}

export type UpdateRecurringInput = CreateRecurringInput
