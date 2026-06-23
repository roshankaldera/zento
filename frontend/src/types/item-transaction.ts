/**
 * Item Transaction (master) + Item Transaction Line (detail) domain types.
 *
 * Mirrors the `stock_trans` / `stock_trans_line` tables. `total` columns (header
 * and line) are computed server-side and only ever read on the client.
 */

/** 1 = Receive, 2 = Issue. */
export type ItemTransactionType = 1 | 2

export interface ItemTransactionLine {
  id: number
  mainId: number
  itemId: number
  description: string | null
  /** Decimals serialized as strings by Prisma. */
  quantity: number
  price: number
  /** Computed server-side: quantity * price. */
  total: number
  inventory?: { id: number; name: string }
}

export interface ItemTransaction {
  id: number
  businessId: number
  date: string
  requestBy: number | null
  type: ItemTransactionType
  /** Computed server-side: sum of line totals. */
  total: number
  remark: string | null
  business?: { id: number; name: string }
  requester?: { id: number; name: string; empNo: string }
  /** Present on detail (findOne) responses. */
  lines?: ItemTransactionLine[]
  /** Present on list (findAll) responses. */
  _count?: { lines: number }
}

/** A single line in the create/update payload (server assigns id, main_id, total). */
export interface CreateItemTransactionLineInput {
  itemId: number
  description?: string | null
  quantity: number
  price: number
}

/** Payload to create a transaction header together with its lines. */
export interface CreateItemTransactionInput {
  businessId: number
  date: string
  requestBy?: number | null
  type: ItemTransactionType
  remark?: string | null
  lines: CreateItemTransactionLineInput[]
}

export type UpdateItemTransactionInput = CreateItemTransactionInput
