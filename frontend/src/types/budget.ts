/**
 * Budget (master) + Budget Line (detail) domain types.
 *
 * Mirrors the `budget` / `budget_line` tables. There is no status column on the
 * master; one budget is allowed per (business_id, year) pair.
 */

/** The 12 month amount keys shared by lines and the create input. */
export type BudgetMonth =
  | "january"
  | "february"
  | "march"
  | "april"
  | "may"
  | "june"
  | "july"
  | "august"
  | "september"
  | "october"
  | "november"
  | "december"

export interface BudgetLine {
  id: number
  mainId: number
  accountId: number
  description: string | null
  /** Decimals serialized as strings by Prisma. */
  january: number
  february: number
  march: number
  april: number
  may: number
  june: number
  july: number
  august: number
  september: number
  october: number
  november: number
  december: number
  account?: { id: number; code: string; name: string }
}

export interface Budget {
  id: number
  businessId: number
  year: number
  business?: { id: number; name: string }
  /** Present on detail (findOne) responses. */
  lines?: BudgetLine[]
  /** Present on list (findAll) responses. */
  _count?: { lines: number }
}

/** A single line in the create/update payload (server assigns id + main_id). */
export interface CreateBudgetLineInput {
  accountId: number
  description?: string | null
  january: number
  february: number
  march: number
  april: number
  may: number
  june: number
  july: number
  august: number
  september: number
  october: number
  november: number
  december: number
}

/** Payload to create a budget header together with its lines. */
export interface CreateBudgetInput {
  businessId: number
  year: number
  lines: CreateBudgetLineInput[]
}

export type UpdateBudgetInput = CreateBudgetInput
