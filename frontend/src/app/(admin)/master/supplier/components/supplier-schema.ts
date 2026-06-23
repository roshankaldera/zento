import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type { Supplier, SupplierStatus } from "@/types/supplier"

/**
 * Supplier form contract. `status` is committed as a string (Radix Select);
 * `balance` is held in form state but never user-edited — it is system-managed
 * (starts at 0 on create, unchanged on edit). Mapped back at the submit boundary.
 */
export const supplierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer"),
  contactPerson: z
    .string()
    .trim()
    .max(100, "Contact person must be 100 characters or fewer")
    .optional(),
  contactNo: z
    .string()
    .trim()
    .max(10, "Contact no must be 10 characters or fewer")
    .optional(),
  balance: z.number(),
  status: z.enum(["1", "2"]),
})

export type SupplierFormValues = z.infer<typeof supplierSchema>

/** Status dropdown options (value matches the tinyint stored in the DB). */
export const statusOptions: Option[] = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "2" },
]

/** Format a money value (Prisma serializes decimals as strings). */
export const formatMoney = (value: number | string): string =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

/** Default values for the create form (balance starts at 0). */
export const supplierFormDefaults: SupplierFormValues = {
  name: "",
  contactPerson: "",
  contactNo: "",
  balance: 0,
  status: "1",
}

/** Map a loaded record into form values (number status -> string). */
export function toSupplierFormValues(supplier: Supplier): SupplierFormValues {
  return {
    name: supplier.name,
    contactPerson: supplier.contactPerson ?? "",
    contactNo: supplier.contactNo ?? "",
    balance: Number(supplier.balance),
    status: String(supplier.status) as SupplierFormValues["status"],
  }
}

/** Map submitted form values into the service input (string -> number). */
export function toSupplierInput(values: SupplierFormValues) {
  return {
    name: values.name.trim(),
    contactPerson: values.contactPerson ?? "",
    contactNo: values.contactNo ?? "",
    balance: values.balance,
    status: Number(values.status) as SupplierStatus,
  }
}
