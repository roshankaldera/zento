import { format, parseISO } from "date-fns"
import { z } from "zod"

import type { OtherHarvest } from "@/types/other-harvest"

/**
 * Other Harvest form contract. `estateId`/`supplierId`/`cropId` are committed as
 * strings (Radix autocomplete only deals in strings); `date` is a real `Date`
 * (Radix date picker); `quantity`/`value` are real numbers. Everything is mapped
 * back to its domain type at the submit boundary (see `toOtherHarvestInput`).
 */
export const otherHarvestSchema = z.object({
  estateId: z.string().min(1, "Estate is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  cropId: z.string().min(1, "Crop is required"),
  date: z.date({ error: "Date is required" }),
  quantity: z
    .number({ error: "Quantity is required" })
    .min(0, "Cannot be negative"),
  value: z.number({ error: "Value is required" }).min(0, "Cannot be negative"),
  reference: z
    .string()
    .trim()
    .max(100, "Reference must be 100 characters or fewer")
    .optional(),
  remark: z
    .string()
    .trim()
    .max(100, "Remark must be 100 characters or fewer")
    .optional(),
})

export type OtherHarvestFormValues = z.infer<typeof otherHarvestSchema>

/** Format a numeric value (Prisma serializes decimals as strings). */
export const formatNumber = (value: number | string): string =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

/** Default values for the create form (date = today). */
export const otherHarvestFormDefaults: OtherHarvestFormValues = {
  estateId: "",
  supplierId: "",
  cropId: "",
  date: new Date(),
  quantity: 0,
  value: 0,
  reference: "",
  remark: "",
}

/** Map a loaded record into form values (numbers -> strings, ISO -> Date). */
export function toOtherHarvestFormValues(
  harvest: OtherHarvest,
): OtherHarvestFormValues {
  return {
    estateId: String(harvest.estateId),
    supplierId: String(harvest.supplierId),
    cropId: String(harvest.cropId),
    date: parseISO(harvest.date.slice(0, 10)),
    quantity: Number(harvest.quantity),
    value: Number(harvest.value),
    reference: harvest.reference ?? "",
    remark: harvest.remark ?? "",
  }
}

/** Map submitted form values into the service input (strings -> domain types). */
export function toOtherHarvestInput(values: OtherHarvestFormValues) {
  const reference = values.reference?.trim()
  const remark = values.remark?.trim()
  return {
    estateId: Number(values.estateId),
    supplierId: Number(values.supplierId),
    cropId: Number(values.cropId),
    date: format(values.date, "yyyy-MM-dd"),
    quantity: values.quantity,
    value: values.value,
    reference: reference ? reference : null,
    remark: remark ? remark : null,
  }
}
