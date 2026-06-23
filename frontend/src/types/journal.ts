/**
 * Journal (master) + Journal Line (detail) domain types.
 *
 * Mirrors the `journal` / `journal_line` tables. `total_value` is computed
 * server-side; `post_by`/`post_time`/`status` are stamped at save time.
 */

/** 1 = Draft, 2 = Finish, 3 = Canceled. */
export type JournalStatus = 1 | 2 | 3

/** 1 = Income, 2 = Expenses. */
export type JournalLineType = 1 | 2

export interface JournalLine {
  id: number
  mainId: number
  accountId: number
  type: JournalLineType
  description: string | null
  reference: string | null
  assetId: number | null
  empId: number | null
  supplierId: number | null
  /** Decimals serialized as strings by Prisma. */
  value: number
}

export interface Journal {
  id: number
  businessId: number
  bankId: number
  /** Generated server-side on save; null until assigned. */
  journalNo: string | null
  category: number
  date: string
  /** Computed server-side: sum of line values. */
  totalValue: number
  status: JournalStatus
  remark: string | null
  postBy: number
  postTime: string
  business?: { id: number; name: string }
  bank?: { id: number; bank: string }
  journalCategory?: { id: number; name: string }
  /** Present on detail (findOne) responses. */
  lines?: JournalLine[]
  /** Present on list (findAll) responses. */
  _count?: { lines: number }
}

/** A single line in the create/update payload (server assigns id + main_id). */
export interface CreateJournalLineInput {
  accountId: number
  type: JournalLineType
  description?: string | null
  reference?: string | null
  assetId?: number | null
  empId?: number | null
  supplierId?: number | null
  value: number
}

/** Payload to create a journal header together with its lines. */
export interface CreateJournalInput {
  businessId: number
  bankId: number
  category: number
  date: string
  remark?: string | null
  postBy: number
  status: JournalStatus
  lines: CreateJournalLineInput[]
}

export type UpdateJournalInput = CreateJournalInput
