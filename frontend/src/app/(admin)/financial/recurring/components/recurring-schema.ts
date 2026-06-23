import { format, parseISO } from "date-fns"
import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type {
  Recurring,
  RecurringLineType,
  RecurringStatus,
} from "@/types/recurring"

/**
 * One recurring line. FK ids and `type` are committed as strings (autocomplete
 * / Select); the optional FK ids are "" when unset. `value` is a real number.
 * Mapped back at the submit boundary (see `toRecurringInput`).
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
 * Recurring form contract. FK ids are strings (autocomplete); the periods are
 * optional `Date`s; `recurringDay` is a number; `status` is a string Select;
 * `lines` always holds at least one row.
 */
export const recurringSchema = z.object({
  businessId: z.string().min(1, "Business is required"),
  bankId: z.string().min(1, "Bank is required"),
  category: z.string().min(1, "Category is required"),
  recurringDay: z
    .number({ error: "Recurring day is required" })
    .int("Day must be a whole number")
    .min(1, "Day must be between 1 and 31")
    .max(31, "Day must be between 1 and 31"),
  fromPeriod: z.date().optional(),
  toPeriod: z.date().optional(),
  status: z.enum(["1", "2"]),
  remark: z
    .string()
    .trim()
    .max(100, "Remark must be 100 characters or fewer")
    .optional(),
  lines: z.array(lineSchema).min(1, "Add at least one line"),
})

export type RecurringFormValues = z.infer<typeof recurringSchema>
export type RecurringLineFormValues = z.infer<typeof lineSchema>

/** Status dropdown options (value matches the tinyint stored in the DB). */
export const statusOptions: Option[] = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "2" },
]

/** Line type dropdown options. */
export const typeOptions: Option[] = [
  { label: "Income", value: "1" },
  { label: "Expenses", value: "2" },
]

/** Human label for a stored status. */
export const statusLabel = (status: number): string =>
  statusOptions.find((o) => o.value === String(status))?.label ?? "—"

/** Format a money value (Prisma serializes decimals as strings). */
export const formatMoney = (value: number | string): string =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

/** A blank line, appended whenever the user clicks "Add line". */
export const emptyLine: RecurringLineFormValues = {
  accountId: "",
  type: "1",
  description: "",
  reference: "",
  assetId: "",
  empId: "",
  supplierId: "",
  value: 0,
}

/** Default values for the create form (status = Active; one empty line). */
export const recurringFormDefaults: RecurringFormValues = {
  businessId: "",
  bankId: "",
  category: "",
  recurringDay: 1,
  fromPeriod: undefined,
  toPeriod: undefined,
  status: "1",
  remark: "",
  lines: [{ ...emptyLine }],
}

/** Optional FK id (number | null) -> form string ("" when unset). */
const idToStr = (v: number | null | undefined) => (v != null ? String(v) : "")

/** Map a loaded record into form values (numbers -> strings, ISO -> Date). */
export function toRecurringFormValues(row: Recurring): RecurringFormValues {
  return {
    businessId: String(row.businessId),
    bankId: String(row.bankId),
    category: String(row.category),
    recurringDay: row.recurringDay,
    fromPeriod: row.fromPeriod ? parseISO(row.fromPeriod.slice(0, 10)) : undefined,
    toPeriod: row.toPeriod ? parseISO(row.toPeriod.slice(0, 10)) : undefined,
    status: String(row.status) as RecurringFormValues["status"],
    remark: row.remark ?? "",
    lines: (row.lines ?? []).map((line) => ({
      accountId: String(line.accountId),
      type: String(line.type) as RecurringLineFormValues["type"],
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

/** Map submitted form values into the service input (strings -> numbers). */
export function toRecurringInput(values: RecurringFormValues) {
  return {
    businessId: Number(values.businessId),
    bankId: Number(values.bankId),
    category: Number(values.category),
    recurringDay: values.recurringDay,
    fromPeriod: values.fromPeriod ? format(values.fromPeriod, "yyyy-MM-dd") : null,
    toPeriod: values.toPeriod ? format(values.toPeriod, "yyyy-MM-dd") : null,
    status: Number(values.status) as RecurringStatus,
    remark: values.remark?.trim() ? values.remark.trim() : null,
    lines: values.lines.map((line) => ({
      accountId: Number(line.accountId),
      type: Number(line.type) as RecurringLineType,
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
