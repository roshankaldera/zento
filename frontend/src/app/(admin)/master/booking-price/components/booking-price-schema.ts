import { format, parseISO } from "date-fns"
import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type { BookingPriceList } from "@/types/booking-price"

/**
 * A villa-room option that also carries its owning `businessId`, so the form can
 * filter the room list down to the header's selected business client-side.
 */
export interface BusinessScopedOption extends Option {
  businessId: number
}

const priceField = z
  .number({ error: "Required" })
  .min(0, "Cannot be negative")

/**
 * One booking price line. `roomId` is committed as a string (Radix autocomplete);
 * the four price tiers are real numbers. Mapped back at the submit boundary (see
 * `toBookingPriceInput`).
 */
const lineSchema = z.object({
  roomId: z.string().min(1, "Room is required"),
  otaPrice: priceField,
  directPrice: priceField,
  dmcPrice: priceField,
  localPrice: priceField,
})

/**
 * Booking price form contract. `businessId` is a string (Radix select); `fromDate`
 * /`toDate` are real `Date`s; `lines` holds ≥1 room-price row. Everything is
 * mapped back via `toBookingPriceInput`.
 */
export const bookingPriceSchema = z
  .object({
    businessId: z.string().min(1, "Business is required"),
    fromDate: z.date({ error: "From date is required" }),
    toDate: z.date({ error: "To date is required" }),
    remark: z
      .string()
      .trim()
      .max(100, "Remark must be 100 characters or fewer")
      .optional(),
    lines: z.array(lineSchema).min(1, "Add at least one line"),
  })
  .refine((v) => v.toDate >= v.fromDate, {
    path: ["toDate"],
    message: "To date cannot be before From date",
  })

export type BookingPriceFormValues = z.infer<typeof bookingPriceSchema>
export type BookingPriceLineFormValues = z.infer<typeof lineSchema>

/** Format a money value (Prisma serializes decimals as strings). */
export const formatMoney = (value: number | string): string =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

/** A blank price line, appended whenever the user clicks "Add line". */
export const emptyBookingPriceLine: BookingPriceLineFormValues = {
  roomId: "",
  otaPrice: 0,
  directPrice: 0,
  dmcPrice: 0,
  localPrice: 0,
}

/** Default values for the create form (one empty line to start). */
export const bookingPriceFormDefaults: BookingPriceFormValues = {
  businessId: "",
  // Validation enforces real dates on submit; the picker handles `undefined`.
  fromDate: undefined as unknown as Date,
  toDate: undefined as unknown as Date,
  remark: "",
  lines: [{ ...emptyBookingPriceLine }],
}

/** Map a loaded record into form values (numbers -> strings, ISO -> Date). */
export function toBookingPriceFormValues(
  bookingPrice: BookingPriceList,
): BookingPriceFormValues {
  return {
    businessId: String(bookingPrice.businessId),
    fromDate: parseISO(bookingPrice.fromDate.slice(0, 10)),
    toDate: parseISO(bookingPrice.toDate.slice(0, 10)),
    remark: bookingPrice.remark ?? "",
    lines: (bookingPrice.lines ?? []).map((line) => ({
      roomId: String(line.roomId),
      otaPrice: Number(line.otaPrice),
      directPrice: Number(line.directPrice),
      dmcPrice: Number(line.dmcPrice),
      localPrice: Number(line.localPrice),
    })),
  }
}

/** Map submitted form values into the service input (strings -> numbers). */
export function toBookingPriceInput(values: BookingPriceFormValues) {
  return {
    businessId: Number(values.businessId),
    fromDate: format(values.fromDate, "yyyy-MM-dd"),
    toDate: format(values.toDate, "yyyy-MM-dd"),
    remark: values.remark ?? "",
    lines: values.lines.map((line) => ({
      roomId: Number(line.roomId),
      otaPrice: line.otaPrice,
      directPrice: line.directPrice,
      dmcPrice: line.dmcPrice,
      localPrice: line.localPrice,
    })),
  }
}
