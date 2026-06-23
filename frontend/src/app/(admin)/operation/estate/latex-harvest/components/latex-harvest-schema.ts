import { format, parseISO } from "date-fns"
import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type { LatexHarvest, LatexLineStatus } from "@/types/latex-harvest"

/**
 * One latex line. `employeeId` and `status` are committed as strings (Radix
 * Select / autocomplete); `liter`/`ottapalu` are real numbers. Mapped back at
 * the submit boundary (see `toLatexHarvestInput`).
 */
const lineSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  liter: z.number({ error: "Liter is required" }).min(0, "Cannot be negative"),
  ottapalu: z
    .number({ error: "Ottapalu is required" })
    .min(0, "Cannot be negative"),
  status: z.enum(["1", "2", "3", "4", "5"]),
})

/**
 * Latex Harvest form contract. `estateId` is a string (autocomplete); `date` is
 * a real `Date` (picker); `rainfall` is an optional number; `lines` always holds
 * at least one row.
 */
export const latexHarvestSchema = z.object({
  estateId: z.string().min(1, "Estate is required"),
  date: z.date({ error: "Date is required" }),
  rainfall: z.number().min(0, "Cannot be negative").optional(),
  remark: z
    .string()
    .trim()
    .max(100, "Remark must be 100 characters or fewer")
    .optional(),
  lines: z.array(lineSchema).min(1, "Add at least one line"),
})

export type LatexHarvestFormValues = z.infer<typeof latexHarvestSchema>
export type LatexLineFormValues = z.infer<typeof lineSchema>

/** Status dropdown options (value matches the tinyint stored in the DB). */
export const statusOptions: Option[] = [
  { label: "Present", value: "1" },
  { label: "Absent", value: "2" },
  { label: "Rain", value: "3" },
  { label: "Rain+Work", value: "4" },
  { label: "Another duty", value: "5" },
]

/** Human label for a stored line status. */
export const statusLabel = (status: number): string =>
  statusOptions.find((o) => o.value === String(status))?.label ?? "—"

/** A blank line, appended whenever the user clicks "Add line". */
export const emptyLatexLine: LatexLineFormValues = {
  employeeId: "",
  liter: 0,
  ottapalu: 0,
  status: "1",
}

/** Default values for the create form (date = today; one empty line). */
export const latexHarvestFormDefaults: LatexHarvestFormValues = {
  estateId: "",
  date: new Date(),
  rainfall: undefined,
  remark: "",
  lines: [{ ...emptyLatexLine }],
}

/** Map a loaded record into form values (numbers -> strings, ISO -> Date). */
export function toLatexHarvestFormValues(
  harvest: LatexHarvest,
): LatexHarvestFormValues {
  return {
    estateId: String(harvest.estateId),
    date: parseISO(harvest.date.slice(0, 10)),
    rainfall: harvest.rainfall != null ? Number(harvest.rainfall) : undefined,
    remark: harvest.remark ?? "",
    lines: (harvest.lines ?? []).map((line) => ({
      employeeId: String(line.employeeId),
      liter: Number(line.liter),
      ottapalu: Number(line.ottapalu),
      status: String(line.status) as LatexLineFormValues["status"],
    })),
  }
}

/** Map submitted form values into the service input (strings -> numbers). */
export function toLatexHarvestInput(values: LatexHarvestFormValues) {
  const remark = values.remark?.trim()
  return {
    estateId: Number(values.estateId),
    date: format(values.date, "yyyy-MM-dd"),
    rainfall: values.rainfall ?? null,
    remark: remark ? remark : null,
    lines: values.lines.map((line) => ({
      employeeId: Number(line.employeeId),
      liter: line.liter,
      ottapalu: line.ottapalu,
      status: Number(line.status) as LatexLineStatus,
    })),
  }
}
