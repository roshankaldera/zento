/**
 * Reimbursement (master) + Reimbursement Line (detail) domain types.
 *
 * Mirrors the `reimbursement` / `reimbursement_line` tables. `total_value` is
 * computed server-side; `post_by`/`post_time`/`status` are stamped at save time.
 */

/** 1 = Draft, 2 = Finish, 3 = Canceled. */
export type ReimbursementStatus = 1 | 2 | 3

export interface ReimbursementLine {
  id: number
  mainId: number
  billDate: string | null
  description: string | null
  reference: string | null
  /** Decimals serialized as strings by Prisma. */
  value: number
}

export interface Reimbursement {
  id: number
  businessId: number
  /** Generated server-side on save; null until assigned. */
  reimbursementNo: string | null
  date: string
  /** Computed server-side: sum of line values. */
  totalValue: number
  status: ReimbursementStatus
  remark: string | null
  postBy: number
  postTime: string
  business?: { id: number; name: string }
  /** Present on detail (findOne) responses. */
  lines?: ReimbursementLine[]
  /** Present on list (findAll) responses. */
  _count?: { lines: number }
}

/** A single line in the create/update payload (server assigns id + main_id). */
export interface CreateReimbursementLineInput {
  billDate?: string | null
  description?: string | null
  reference?: string | null
  value: number
}

/** Payload to create a reimbursement header together with its lines. */
export interface CreateReimbursementInput {
  businessId: number
  date: string
  remark?: string | null
  postBy: number
  status: ReimbursementStatus
  lines: CreateReimbursementLineInput[]
}

export type UpdateReimbursementInput = CreateReimbursementInput
