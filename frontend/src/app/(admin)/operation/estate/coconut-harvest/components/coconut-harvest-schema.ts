import { format, parseISO } from "date-fns"
import { z } from "zod"

import type { CoconutHarvest } from "@/types/coconut-harvest"

/**
 * One harvest line. The division is fixed per row (auto-loaded from the estate);
 * `divisionName` is carried for display only and dropped at the submit boundary.
 * `quantity` is the user-entered integer.
 */
const lineSchema = z.object({
  divisionId: z.string().min(1, "Division is required"),
  divisionName: z.string(),
  quantity: z
    .number({ error: "Quantity is required" })
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative"),
})

/**
 * Coconut Harvest form contract. `estateId` is a string (autocomplete); `date`
 * is a real `Date` (picker); `lines` always holds at least one row.
 */
export const coconutHarvestSchema = z.object({
  estateId: z.string().min(1, "Estate is required"),
  date: z.date({ error: "Date is required" }),
  remark: z
    .string()
    .trim()
    .max(100, "Remark must be 100 characters or fewer")
    .optional(),
  lines: z.array(lineSchema).min(1, "Add at least one line"),
})

export type CoconutHarvestFormValues = z.infer<typeof coconutHarvestSchema>
export type CoconutHarvestLineFormValues = z.infer<typeof lineSchema>

/** Default values for the create form (date = today; lines load on estate select). */
export const coconutHarvestFormDefaults: CoconutHarvestFormValues = {
  estateId: "",
  date: new Date(),
  remark: "",
  lines: [],
}

/** Map a loaded record into form values (numbers -> strings, ISO -> Date). */
export function toCoconutHarvestFormValues(
  harvest: CoconutHarvest,
): CoconutHarvestFormValues {
  return {
    estateId: String(harvest.estateId),
    date: parseISO(harvest.date.slice(0, 10)),
    remark: harvest.remark ?? "",
    lines: (harvest.lines ?? []).map((line) => ({
      divisionId: String(line.divisionId),
      divisionName: line.division?.name ?? `#${line.divisionId}`,
      quantity: line.quantity,
    })),
  }
}

/** Map submitted form values into the service input (strings -> numbers). */
export function toCoconutHarvestInput(values: CoconutHarvestFormValues) {
  const remark = values.remark?.trim()
  return {
    estateId: Number(values.estateId),
    date: format(values.date, "yyyy-MM-dd"),
    remark: remark ? remark : null,
    lines: values.lines.map((line) => ({
      divisionId: Number(line.divisionId),
      quantity: line.quantity,
    })),
  }
}
