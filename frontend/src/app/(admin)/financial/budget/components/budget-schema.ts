import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type { Budget, BudgetMonth } from "@/types/budget"

/** Selectable budget years (value matches the int stored in the DB). */
export const yearOptions: Option[] = [
  "2026",
  "2027",
  "2028",
  "2029",
  "2030",
].map((y) => ({ label: y, value: y }))

/** The 12 month keys, in calendar order (also used to render columns). */
export const MONTHS: { key: BudgetMonth; label: string }[] = [
  { key: "january", label: "Jan" },
  { key: "february", label: "Feb" },
  { key: "march", label: "Mar" },
  { key: "april", label: "Apr" },
  { key: "may", label: "May" },
  { key: "june", label: "Jun" },
  { key: "july", label: "Jul" },
  { key: "august", label: "Aug" },
  { key: "september", label: "Sep" },
  { key: "october", label: "Oct" },
  { key: "november", label: "Nov" },
  { key: "december", label: "Dec" },
]

const monthAmount = z.number({ error: "Required" }).min(0, "Cannot be negative")

/**
 * One budget line. `accountId` is committed as a string (autocomplete); the 12
 * month amounts are real numbers. Mapped back at the submit boundary (see
 * `toBudgetInput`).
 */
const lineSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  description: z
    .string()
    .trim()
    .max(100, "Description must be 100 characters or fewer")
    .optional(),
  january: monthAmount,
  february: monthAmount,
  march: monthAmount,
  april: monthAmount,
  may: monthAmount,
  june: monthAmount,
  july: monthAmount,
  august: monthAmount,
  september: monthAmount,
  october: monthAmount,
  november: monthAmount,
  december: monthAmount,
})

/**
 * Budget form contract. `businessId` and `year` are strings (Select /
 * autocomplete), mapped back to numbers at the submit boundary; `lines` always
 * holds at least one row.
 */
export const budgetSchema = z.object({
  businessId: z.string().min(1, "Business is required"),
  year: z.enum(["2026", "2027", "2028", "2029", "2030"], {
    error: "Year is required",
  }),
  lines: z.array(lineSchema).min(1, "Add at least one line"),
})

export type BudgetFormValues = z.infer<typeof budgetSchema>
export type BudgetLineFormValues = z.infer<typeof lineSchema>

/** A blank line, appended whenever the user clicks "Add line". */
export const emptyLine: BudgetLineFormValues = {
  accountId: "",
  description: "",
  january: 0,
  february: 0,
  march: 0,
  april: 0,
  may: 0,
  june: 0,
  july: 0,
  august: 0,
  september: 0,
  october: 0,
  november: 0,
  december: 0,
}

/** Default values for the create form (one empty line). */
export const budgetFormDefaults: BudgetFormValues = {
  businessId: "",
  year: "2026",
  lines: [{ ...emptyLine }],
}

/** Map a loaded record into form values (numbers -> strings where needed). */
export function toBudgetFormValues(budget: Budget): BudgetFormValues {
  return {
    businessId: String(budget.businessId),
    year: String(budget.year) as BudgetFormValues["year"],
    lines: (budget.lines ?? []).map((line) => ({
      accountId: String(line.accountId),
      description: line.description ?? "",
      january: Number(line.january),
      february: Number(line.february),
      march: Number(line.march),
      april: Number(line.april),
      may: Number(line.may),
      june: Number(line.june),
      july: Number(line.july),
      august: Number(line.august),
      september: Number(line.september),
      october: Number(line.october),
      november: Number(line.november),
      december: Number(line.december),
    })),
  }
}

/** Map submitted form values into the service input (strings -> numbers). */
export function toBudgetInput(values: BudgetFormValues) {
  return {
    businessId: Number(values.businessId),
    year: Number(values.year),
    lines: values.lines.map((line) => {
      const description = line.description?.trim()
      return {
        accountId: Number(line.accountId),
        description: description ? description : null,
        january: line.january,
        february: line.february,
        march: line.march,
        april: line.april,
        may: line.may,
        june: line.june,
        july: line.july,
        august: line.august,
        september: line.september,
        october: line.october,
        november: line.november,
        december: line.december,
      }
    }),
  }
}

/** Sum the 12 month amounts of one line (display-only row total). */
export function lineTotal(line: Partial<BudgetLineFormValues> | undefined): number {
  if (!line) return 0
  return MONTHS.reduce((sum, m) => sum + (Number(line[m.key]) || 0), 0)
}
