import { format, parseISO } from "date-fns"
import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type { CashTransfer, CashTransferStatus } from "@/types/cash-transfer"

/**
 * Cash Transfer form contract. FK ids and `status` are committed as strings
 * (Radix Select / autocomplete); `value`/`postBy` are real numbers; `date` is a
 * real `Date`. Mapped back at the submit boundary (see `toCashTransferInput`).
 *
 * Business rule: from_bank and to_bank cannot be equal (enforced here and again
 * on the server).
 */
export const cashTransferSchema = z
  .object({
    cashTransfer: z
      .string()
      .max(15, "Cash Transfer No must be 15 characters or fewer")
      .optional(),
    fromBank: z.string().min(1, "From Bank is required"),
    toBank: z.string().min(1, "To Bank is required"),
    date: z.date({ error: "Date is required" }),
    value: z.number({ error: "Value is required" }).min(0, "Cannot be negative"),
    description: z
      .string()
      .trim()
      .max(100, "Description must be 100 characters or fewer")
      .optional(),
    reference: z
      .string()
      .trim()
      .max(100, "Reference must be 100 characters or fewer")
      .optional(),
    status: z.enum(["1", "2", "3"]),
  })
  .refine((v) => v.fromBank !== v.toBank, {
    message: "From Bank and To Bank cannot be the same",
    path: ["toBank"],
  })

export type CashTransferFormValues = z.infer<typeof cashTransferSchema>

/** Status dropdown options (value matches the tinyint stored in the DB). */
export const statusOptions: Option[] = [
  { label: "Draft", value: "1" },
  { label: "Finish", value: "2" },
  { label: "Canceled", value: "3" },
]

/** Human label for a stored status. */
export const statusLabel = (status: number): string =>
  statusOptions.find((o) => o.value === String(status))?.label ?? "—"

/** Badge variant per status. */
export const statusVariant = (
  status: number,
): "default" | "secondary" | "destructive" =>
  status === 2 ? "default" : status === 3 ? "destructive" : "secondary"

/** Format a money value (Prisma serializes decimals as strings). */
export const formatMoney = (value: number | string): string =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

/** Default values for the create form (date = today; status set on save). */
export const cashTransferFormDefaults: CashTransferFormValues = {
  cashTransfer: "",
  fromBank: "",
  toBank: "",
  date: new Date(),
  value: 0,
  description: "",
  reference: "",
  // Server forces 2 (Finish) on create; this is a placeholder for the contract.
  status: "2",
}

/** Map a loaded record into form values (numbers -> strings, ISO -> Date). */
export function toCashTransferFormValues(
  row: CashTransfer,
): CashTransferFormValues {
  return {
    cashTransfer: row.cashTransfer ?? "",
    fromBank: String(row.fromBank),
    toBank: String(row.toBank),
    date: parseISO(row.date.slice(0, 10)),
    value: Number(row.value),
    description: row.description ?? "",
    reference: row.reference ?? "",
    status: String(row.status) as CashTransferFormValues["status"],
  }
}

/**
 * Map submitted form values into the service input (strings -> numbers).
 * `postById` is the signed-in user's id, stamped onto `postBy` at save time.
 */
export function toCashTransferInput(
  values: CashTransferFormValues,
  postById: number,
) {
  return {
    fromBank: Number(values.fromBank),
    toBank: Number(values.toBank),
    date: format(values.date, "yyyy-MM-dd"),
    value: values.value,
    description: values.description?.trim() ? values.description.trim() : null,
    reference: values.reference?.trim() ? values.reference.trim() : null,
    postBy: postById,
    status: Number(values.status) as CashTransferStatus,
  }
}
