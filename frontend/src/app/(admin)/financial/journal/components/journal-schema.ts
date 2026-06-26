import { format, parseISO } from "date-fns"
import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type {
  Journal,
  JournalLineType,
  JournalStatus,
} from "@/types/journal"

/**
 * One journal line. FK ids and `type` are committed as strings (autocomplete /
 * Select); the optional FK ids are "" when unset. `value` is a real number.
 * Mapped back at the submit boundary (see `toJournalInput`).
 */
const lineSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  type: z.enum(["1", "2"]),
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
  assetId: z.string().optional(),
  empId: z.string().optional(),
  supplierId: z.string().optional(),
  value: z.number({ error: "Value is required" }).min(0, "Cannot be negative"),
})

/**
 * Journal form contract. FK ids are strings (autocomplete); `date` is a real
 * `Date`; `postBy` is a number (disabled); `status` is a string Select;
 * `lines` always holds at least one row. `totalValue` is derived for display
 * only and recomputed on the server, so it is not part of the contract.
 */
export const journalSchema = z.object({
  businessId: z.string().min(1, "Business is required"),
  bankId: z.string().min(1, "Bank is required"),
  journalNo: z
    .string()
    .trim()
    .max(20, "Journal No must be 20 characters or fewer")
    .optional(),
  category: z.string().min(1, "Category is required"),
  date: z.date({ error: "Date is required" }),
  remark: z
    .string()
    .trim()
    .max(100, "Remark must be 100 characters or fewer")
    .optional(),
  status: z.enum(["1", "2", "3"]),
  lines: z.array(lineSchema).min(1, "Add at least one line"),
})

export type JournalFormValues = z.infer<typeof journalSchema>
export type JournalLineFormValues = z.infer<typeof lineSchema>

/** Status dropdown options (value matches the tinyint stored in the DB). */
export const statusOptions: Option[] = [
  { label: "Draft", value: "1" },
  { label: "Finish", value: "2" },
  { label: "Canceled", value: "3" },
]

/** Line type dropdown options. */
export const typeOptions: Option[] = [
  { label: "Income", value: "1" },
  { label: "Expenses", value: "2" },
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
export const emptyLine: JournalLineFormValues = {
  accountId: "",
  type: "1",
  description: "",
  reference: "",
  assetId: "",
  empId: "",
  supplierId: "",
  value: 0,
}

/** Default values for the create form (date = today; status set on save). */
export const journalFormDefaults: JournalFormValues = {
  businessId: "",
  bankId: "",
  journalNo: "",
  category: "",
  date: new Date(),
  remark: "",
  // Server forces 2 (Finish) on create; this is a placeholder for the contract.
  status: "2",
  lines: [{ ...emptyLine }],
}

/** Optional FK id (number | null) -> form string ("" when unset). */
const idToStr = (v: number | null | undefined) => (v != null ? String(v) : "")

/** Map a loaded record into form values (numbers -> strings, ISO -> Date). */
export function toJournalFormValues(row: Journal): JournalFormValues {
  return {
    businessId: String(row.businessId),
    bankId: String(row.bankId),
    journalNo: row.journalNo ?? "",
    category: String(row.category),
    date: parseISO(row.date.slice(0, 10)),
    remark: row.remark ?? "",
    status: String(row.status) as JournalFormValues["status"],
    lines: (row.lines ?? []).map((line) => ({
      accountId: String(line.accountId),
      type: String(line.type) as JournalLineFormValues["type"],
      description: line.description ?? "",
      reference: line.reference ?? "",
      assetId: idToStr(line.assetId),
      empId: idToStr(line.empId),
      supplierId: idToStr(line.supplierId),
      value: Number(line.value),
    })),
  }
}

/** Optional FK form string -> number | null. */
const strToId = (v: string | undefined) => (v && v.trim() ? Number(v) : null)

/**
 * Map submitted form values into the service input (strings -> numbers).
 * `postById` is the signed-in user's id, stamped onto `postBy` at save time.
 */
export function toJournalInput(values: JournalFormValues, postById: number) {
  return {
    businessId: Number(values.businessId),
    bankId: Number(values.bankId),
    category: Number(values.category),
    date: format(values.date, "yyyy-MM-dd"),
    remark: values.remark?.trim() ? values.remark.trim() : null,
    postBy: postById,
    status: Number(values.status) as JournalStatus,
    lines: values.lines.map((line) => ({
      accountId: Number(line.accountId),
      type: Number(line.type) as JournalLineType,
      description: line.description?.trim() ? line.description.trim() : null,
      reference: line.reference?.trim() ? line.reference.trim() : null,
      assetId: strToId(line.assetId),
      empId: strToId(line.empId),
      supplierId: strToId(line.supplierId),
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
