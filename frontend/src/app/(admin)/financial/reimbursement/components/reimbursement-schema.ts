import { format, parseISO } from "date-fns"
import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type {
  Reimbursement,
  ReimbursementStatus,
} from "@/types/reimbursement"

/**
 * One reimbursement line. `value` is a real number; `billDate` is an optional
 * `Date` (picker). Mapped back at the submit boundary (see `toReimbursementInput`).
 */
const lineSchema = z.object({
  billDate: z.date().optional(),
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
  value: z.number({ error: "Value is required" }).min(0, "Cannot be negative"),
})

/**
 * Reimbursement form contract. `businessId` is a string (autocomplete); `date`
 * is a real `Date`; `postBy` is a number (disabled); `status` is a string
 * Select; `lines` always holds at least one row. `totalValue` is derived for
 * display only and recomputed on the server, so it is not part of the contract.
 */
export const reimbursementSchema = z.object({
  businessId: z.string().min(1, "Business is required"),
  reimbursementNo: z
    .string()
    .trim()
    .max(20, "Reimbursement No must be 20 characters or fewer")
    .optional(),
  date: z.date({ error: "Date is required" }),
  remark: z
    .string()
    .trim()
    .max(100, "Remark must be 100 characters or fewer")
    .optional(),
  status: z.enum(["1", "2", "3"]),
  lines: z.array(lineSchema).min(1, "Add at least one line"),
})

export type ReimbursementFormValues = z.infer<typeof reimbursementSchema>
export type ReimbursementLineFormValues = z.infer<typeof lineSchema>

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

/** A blank line, appended whenever the user clicks "Add line". */
export const emptyLine: ReimbursementLineFormValues = {
  billDate: undefined,
  description: "",
  reference: "",
  value: 0,
}

/** Default values for the create form (date = today; status set on save). */
export const reimbursementFormDefaults: ReimbursementFormValues = {
  businessId: "",
  reimbursementNo: "",
  date: new Date(),
  remark: "",
  // Server forces 2 (Finish) on create; this is a placeholder for the contract.
  status: "2",
  lines: [{ ...emptyLine }],
}

/** Map a loaded record into form values (numbers -> strings, ISO -> Date). */
export function toReimbursementFormValues(
  row: Reimbursement,
): ReimbursementFormValues {
  return {
    businessId: String(row.businessId),
    reimbursementNo: row.reimbursementNo ?? "",
    date: parseISO(row.date.slice(0, 10)),
    remark: row.remark ?? "",
    status: String(row.status) as ReimbursementFormValues["status"],
    lines: (row.lines ?? []).map((line) => ({
      billDate: line.billDate ? parseISO(line.billDate.slice(0, 10)) : undefined,
      description: line.description ?? "",
      reference: line.reference ?? "",
      value: Number(line.value),
    })),
  }
}

/**
 * Map submitted form values into the service input (strings -> numbers).
 * `postById` is the signed-in user's id, stamped onto `postBy` at save time.
 */
export function toReimbursementInput(
  values: ReimbursementFormValues,
  postById: number,
) {
  return {
    businessId: Number(values.businessId),
    date: format(values.date, "yyyy-MM-dd"),
    remark: values.remark?.trim() ? values.remark.trim() : null,
    postBy: postById,
    status: Number(values.status) as ReimbursementStatus,
    lines: values.lines.map((line) => ({
      billDate: line.billDate ? format(line.billDate, "yyyy-MM-dd") : null,
      description: line.description?.trim() ? line.description.trim() : null,
      reference: line.reference?.trim() ? line.reference.trim() : null,
      value: line.value,
    })),
  }
}

/** Sum the line values for the display-only total. */
export function linesTotal(
  lines: { value?: number | null }[] | undefined,
): number {
  return (lines ?? []).reduce((sum, l) => sum + (Number(l?.value) || 0), 0)
}
