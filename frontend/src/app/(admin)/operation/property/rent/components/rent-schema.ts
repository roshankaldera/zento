import { format, parseISO } from "date-fns"
import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type { Rent, RentStatus } from "@/types/rent"

/**
 * An asset option that also carries its owning `businessId`, so the form can
 * filter the list down to the selected business client-side.
 */
export interface BusinessScopedOption extends Option {
  businessId: number
}

const money = z.number({ error: "Required" }).min(0, "Cannot be negative")

/**
 * Rent form contract. FK ids and `status` are committed as strings (Radix
 * Select / autocomplete); money fields are real numbers; dates are real `Date`s;
 * `whtCertificateCollected` is a boolean. Mapped back at the submit boundary.
 */
export const rentSchema = z.object({
  businessId: z.string().min(1, "Business is required"),
  assetId: z.string().min(1, "Asset is required"),
  tenant: z
    .string()
    .trim()
    .min(1, "Tenant is required")
    .max(100, "Tenant must be 100 characters or fewer"),
  advancedPayment: money,
  securityBond: money,
  rentValue: money,
  whtValue: money,
  whtCertificateCollected: z.boolean(),
  startDate: z.date({ error: "Start date is required" }),
  endDate: z.date({ error: "End date is required" }),
  paymentDay: z
    .number({ error: "Payment day is required" })
    .int("Payment day must be a whole number")
    .min(1, "Payment day must be between 1 and 31")
    .max(31, "Payment day must be between 1 and 31"),
  status: z.enum(["1", "2", "3"]),
})

export type RentFormValues = z.infer<typeof rentSchema>

/** Status dropdown options (value matches the tinyint stored in the DB). */
export const statusOptions: Option[] = [
  { label: "Active", value: "1" },
  { label: "Finish", value: "2" },
  { label: "Canceled", value: "3" },
]

/** Human label for a stored status. */
export const statusLabel = (status: number): string =>
  statusOptions.find((o) => o.value === String(status))?.label ?? "—"

/** Badge variant per status. */
export const statusVariant = (
  status: number,
): "default" | "secondary" | "destructive" =>
  status === 1 ? "default" : status === 3 ? "destructive" : "secondary"

/** Format a money value (Prisma serializes decimals as strings). */
export const formatMoney = (value: number | string): string =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

/** Default values for the create form. */
export const rentFormDefaults: RentFormValues = {
  businessId: "",
  assetId: "",
  tenant: "",
  advancedPayment: 0,
  securityBond: 0,
  rentValue: 0,
  whtValue: 0,
  whtCertificateCollected: false,
  // Validation enforces real dates on submit; the picker handles `undefined`.
  startDate: undefined as unknown as Date,
  endDate: undefined as unknown as Date,
  paymentDay: 1,
  status: "1",
}

/** Map a loaded record into form values (numbers -> strings, ISO -> Date). */
export function toRentFormValues(rent: Rent): RentFormValues {
  return {
    businessId: String(rent.businessId),
    assetId: String(rent.assetId),
    tenant: rent.tenant,
    advancedPayment: Number(rent.advancedPayment),
    securityBond: Number(rent.securityBond),
    rentValue: Number(rent.rentValue),
    whtValue: Number(rent.whtValue),
    whtCertificateCollected: rent.whtCertificateCollected,
    startDate: parseISO(rent.startDate.slice(0, 10)),
    endDate: parseISO(rent.endDate.slice(0, 10)),
    paymentDay: rent.paymentDay,
    status: String(rent.status) as RentFormValues["status"],
  }
}

/** Map submitted form values into the service input (strings -> numbers). */
export function toRentInput(values: RentFormValues) {
  return {
    businessId: Number(values.businessId),
    assetId: Number(values.assetId),
    tenant: values.tenant.trim(),
    advancedPayment: values.advancedPayment,
    securityBond: values.securityBond,
    rentValue: values.rentValue,
    whtValue: values.whtValue,
    whtCertificateCollected: values.whtCertificateCollected,
    startDate: format(values.startDate, "yyyy-MM-dd"),
    endDate: format(values.endDate, "yyyy-MM-dd"),
    paymentDay: values.paymentDay,
    status: Number(values.status) as RentStatus,
  }
}
