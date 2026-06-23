import { format, parseISO } from "date-fns"
import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type {
  Booking,
  BookingCategory,
  BookingCurrency,
  BookingSegment,
  BookingStatus,
} from "@/types/booking"

/** LKR currency value — when selected, the exchange rate is locked to 1. */
export const LKR = "1"

const moneyField = z
  .number({ error: "Required" })
  .min(0, "Cannot be negative")

/**
 * Booking form contract. Enum/FK fields are committed as strings (Radix Select /
 * autocomplete); dates are real `Date`s; money/integers are real numbers.
 * `roomIds` is a multi-select of villa-room ids (committed as strings), mapped
 * to a number[] at the submit boundary. Everything is mapped back via
 * `toBookingInput`.
 */
export const bookingSchema = z.object({
  bookingNo: z
    .string()
    .max(15, "Booking No must be 15 characters or fewer")
    .optional(),
  businessId: z.string().min(1, "Business is required"),
  category: z.enum(["1", "2"]),
  roomIds: z.array(z.string()).min(1, "At least one room is required"),
  customer: z
    .string()
    .trim()
    .min(1, "Customer is required")
    .max(100, "Customer must be 100 characters or fewer"),
  fromDate: z.date({ error: "From date is required" }),
  toDate: z.date({ error: "To date is required" }),
  pax: z.number({ error: "PAX is required" }).int().min(0, "Cannot be negative"),
  child: z
    .number({ error: "Child is required" })
    .int()
    .min(0, "Cannot be negative"),
  status: z.enum(["1", "2", "3"]),
  segment: z.enum(["1", "2"]),
  currency: z.enum(["1", "2", "3"]),
  exRate: z.number({ error: "Exchange rate is required" }).min(0),
  invoiceValue: moneyField,
  vat: moneyField,
  sscl: moneyField,
  grossRevenue: moneyField,
  commission: moneyField,
  netRevenue: moneyField,
  bankCharges: moneyField,
  finalRevenue: moneyField,
  tscCommission: moneyField,
  payout: moneyField,
})

export type BookingFormValues = z.infer<typeof bookingSchema>

export const categoryOptions: Option[] = [
  { label: "Direct", value: "1" },
  { label: "3rd Party", value: "2" },
]
export const statusOptions: Option[] = [
  { label: "Tentative", value: "1" },
  { label: "Confirmed", value: "2" },
  { label: "Management", value: "3" },
]
export const segmentOptions: Option[] = [
  { label: "OTA", value: "1" },
  { label: "Direct", value: "2" },
]
export const currencyOptions: Option[] = [
  { label: "LKR", value: "1" },
  { label: "USD", value: "2" },
  { label: "EURO", value: "3" },
]

const labelOf = (options: Option[], value: number): string =>
  options.find((o) => o.value === String(value))?.label ?? "—"

export const categoryLabel = (v: number) => labelOf(categoryOptions, v)
export const statusLabel = (v: number) => labelOf(statusOptions, v)
export const segmentLabel = (v: number) => labelOf(segmentOptions, v)
export const currencyLabel = (v: number) => labelOf(currencyOptions, v)

/** Badge variant per status (Tentative / Confirmed / Management). */
export const statusVariant = (
  status: number,
): "default" | "secondary" | "outline" =>
  status === 2 ? "default" : status === 3 ? "outline" : "secondary"

/** Format a money value (Prisma serializes decimals as strings). */
export const formatMoney = (value: number | string): string =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

/** Default values for the create form. */
export const bookingFormDefaults: BookingFormValues = {
  bookingNo: "",
  businessId: "",
  category: "1",
  roomIds: [],
  customer: "",
  fromDate: undefined as unknown as Date,
  toDate: undefined as unknown as Date,
  pax: 0,
  child: 0,
  status: "1",
  segment: "1",
  currency: "1",
  exRate: 1,
  invoiceValue: 0,
  vat: 0,
  sscl: 0,
  grossRevenue: 0,
  commission: 0,
  netRevenue: 0,
  bankCharges: 0,
  finalRevenue: 0,
  tscCommission: 0,
  payout: 0,
}

/** Map a loaded record into form values (numbers -> strings, ISO -> Date). */
export function toBookingFormValues(booking: Booking): BookingFormValues {
  return {
    bookingNo: booking.bookingNo ?? "",
    businessId: String(booking.businessId),
    category: String(booking.category) as BookingFormValues["category"],
    roomIds: booking.roomIds.map(String),
    customer: booking.customer,
    fromDate: parseISO(booking.fromDate.slice(0, 10)),
    toDate: parseISO(booking.toDate.slice(0, 10)),
    pax: booking.pax,
    child: booking.child,
    status: String(booking.status) as BookingFormValues["status"],
    segment: String(booking.segment) as BookingFormValues["segment"],
    currency: String(booking.currency) as BookingFormValues["currency"],
    exRate: Number(booking.exRate),
    invoiceValue: Number(booking.invoiceValue),
    vat: Number(booking.vat),
    sscl: Number(booking.sscl),
    grossRevenue: Number(booking.grossRevenue),
    commission: Number(booking.commission),
    netRevenue: Number(booking.netRevenue),
    bankCharges: Number(booking.bankCharges),
    finalRevenue: Number(booking.finalRevenue),
    tscCommission: Number(booking.tscCommission),
    payout: Number(booking.payout),
  }
}

/** Map submitted form values into the service input (strings -> domain types). */
export function toBookingInput(values: BookingFormValues) {
  const currency = Number(values.currency) as BookingCurrency
  return {
    businessId: Number(values.businessId),
    category: Number(values.category) as BookingCategory,
    roomIds: values.roomIds.map(Number),
    customer: values.customer.trim(),
    fromDate: format(values.fromDate, "yyyy-MM-dd"),
    toDate: format(values.toDate, "yyyy-MM-dd"),
    pax: values.pax,
    child: values.child,
    status: Number(values.status) as BookingStatus,
    segment: Number(values.segment) as BookingSegment,
    currency,
    // Business rule: LKR is always rate 1.
    exRate: currency === 1 ? 1 : values.exRate,
    invoiceValue: values.invoiceValue,
    vat: values.vat,
    sscl: values.sscl,
    grossRevenue: values.grossRevenue,
    commission: values.commission,
    netRevenue: values.netRevenue,
    bankCharges: values.bankCharges,
    finalRevenue: values.finalRevenue,
    tscCommission: values.tscCommission,
    payout: values.payout,
  }
}
