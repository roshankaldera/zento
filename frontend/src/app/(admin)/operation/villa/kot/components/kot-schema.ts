import { format, parseISO } from "date-fns"
import { z } from "zod"

import type { Kot } from "@/types/kot"

/**
 * One KOT line. `quantity` is a real number; `item`/`remark` are strings.
 * Mapped back to its domain type at the submit boundary (see `toKotInput`).
 */
const lineSchema = z.object({
  item: z
    .string()
    .trim()
    .min(1, "Item is required")
    .max(100, "Item must be 100 characters or fewer"),
  quantity: z
    .number({ error: "Quantity is required" })
    .min(0, "Quantity cannot be negative"),
  remark: z
    .string()
    .trim()
    .max(100, "Remark must be 100 characters or fewer")
    .optional(),
})

/**
 * KOT form contract. `businessId`/`bookingId` are strings (Radix autocomplete);
 * `requestTime` is a real `Date` (Radix date picker); `lines` always holds at
 * least one row.
 */
export const kotSchema = z.object({
  businessId: z.string().min(1, "Business is required"),
  bookingId: z.string().min(1, "Booking is required"),
  requestTime: z.date({ error: "Request time is required" }),
  remark: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer")
    .optional(),
  lines: z.array(lineSchema).min(1, "Add at least one line"),
})

export type KotFormValues = z.infer<typeof kotSchema>
export type KotLineFormValues = z.infer<typeof lineSchema>

/** A blank line, appended whenever the user clicks "Add line". */
export const emptyKotLine: KotLineFormValues = {
  item: "",
  quantity: 0,
  remark: "",
}

/** Default values for the create form (one empty line to start). */
export const kotFormDefaults: KotFormValues = {
  businessId: "",
  bookingId: "",
  // Validation enforces a real date on submit; the picker handles `undefined`.
  requestTime: undefined as unknown as Date,
  remark: "",
  lines: [{ ...emptyKotLine }],
}

/** Map a loaded record into form values (numbers -> strings, ISO -> Date). */
export function toKotFormValues(kot: Kot): KotFormValues {
  return {
    businessId: String(kot.businessId),
    bookingId: String(kot.bookingId),
    requestTime: parseISO(kot.requestTime.slice(0, 10)),
    remark: kot.remark ?? "",
    lines: (kot.lines ?? []).map((line) => ({
      item: line.item,
      quantity: Number(line.quantity),
      remark: line.remark ?? "",
    })),
  }
}

/** Map submitted form values into the service input (strings -> domain types). */
export function toKotInput(values: KotFormValues) {
  const remark = values.remark?.trim()
  return {
    businessId: Number(values.businessId),
    bookingId: Number(values.bookingId),
    requestTime: format(values.requestTime, "yyyy-MM-dd"),
    remark: remark ? remark : null,
    lines: values.lines.map((line) => {
      const lineRemark = line.remark?.trim()
      return {
        item: line.item.trim(),
        quantity: line.quantity,
        remark: lineRemark ? lineRemark : null,
      }
    }),
  }
}
