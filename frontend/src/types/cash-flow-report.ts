/**
 * One flattened cash-flow row, as returned by `GET /reports/cash-flow`.
 *
 * Names are pre-joined server-side and `amount` is a plain number, so a row
 * drops straight into the WebDataRocks pivot. Direction is carried by `type`,
 * never by the sign of `amount`.
 */
export interface CashFlowReportRow {
  source: "Journal" | "Cash Transfer" | "Recurring (projected)"
  /** ISO "YYYY-MM-DD". */
  date: string
  business: string
  bank: string
  account: string
  category: string
  type: "Income" | "Expense"
  amount: number
}
