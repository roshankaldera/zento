import { format, parseISO } from "date-fns"
import { z } from "zod"

import type { Soloar } from "@/types/soloar"

/**
 * Soloar form contract. `soloarId` (the referenced solar asset) is committed as
 * a string (Radix autocomplete); `date` is a real `Date`; `meterReading` is a
 * real number. Mapped back at the submit boundary (see `toSoloarInput`).
 */
export const soloarSchema = z.object({
  soloarId: z.string().min(1, "Soloar is required"),
  date: z.date({ error: "Date is required" }),
  meterReading: z
    .number({ error: "Meter reading is required" })
    .min(0, "Meter reading cannot be negative"),
})

export type SoloarFormValues = z.infer<typeof soloarSchema>

/** Format a numeric reading (Prisma serializes decimals as strings). */
export const formatReading = (value: number | string): string =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

/** Default values for the create form. */
export const soloarFormDefaults: SoloarFormValues = {
  soloarId: "",
  // Validation enforces a real date on submit; the picker handles `undefined`.
  date: undefined as unknown as Date,
  meterReading: 0,
}

/** Map a loaded record into form values (numbers -> strings, ISO -> Date). */
export function toSoloarFormValues(soloar: Soloar): SoloarFormValues {
  return {
    soloarId: String(soloar.soloarId),
    date: parseISO(soloar.date.slice(0, 10)),
    meterReading: Number(soloar.meterReading),
  }
}

/** Map submitted form values into the service input (strings -> numbers). */
export function toSoloarInput(values: SoloarFormValues) {
  return {
    soloarId: Number(values.soloarId),
    date: format(values.date, "yyyy-MM-dd"),
    meterReading: values.meterReading,
  }
}
