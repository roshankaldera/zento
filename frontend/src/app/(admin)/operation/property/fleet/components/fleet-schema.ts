import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type { Fleet, FleetStatus } from "@/types/fleet"

/**
 * A vehicle-asset option that also carries its owning `businessId`, so the form
 * can filter the list down to the selected business client-side.
 */
export interface BusinessScopedOption extends Option {
  businessId: number
}

/** mm/dd — month 01-12, day 01-31 (recurring renewal day, no year). */
export const MM_DD = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/

/**
 * Fleet form contract. FK ids and `status` are committed as strings (Radix
 * Select / autocomplete); `licenseDate`/`insuranceDate` are mm/dd text strings
 * validated by regex.
 */
export const fleetSchema = z.object({
  businessId: z.string().min(1, "Business is required"),
  assetId: z.string().min(1, "Fleet asset is required"),
  vehicleNo: z
    .string()
    .trim()
    .min(1, "Vehicle no is required")
    .max(10, "Vehicle no must be 10 characters or fewer"),
  licenseDate: z
    .string()
    .trim()
    .regex(MM_DD, "License date must be in mm/dd format"),
  insuranceDate: z
    .string()
    .trim()
    .regex(MM_DD, "Insurance date must be in mm/dd format"),
  status: z.enum(["1", "2"]),
})

export type FleetFormValues = z.infer<typeof fleetSchema>

/** Status dropdown options (value matches the tinyint stored in the DB). */
export const statusOptions: Option[] = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "2" },
]

/** Default values for the create form. */
export const fleetFormDefaults: FleetFormValues = {
  businessId: "",
  assetId: "",
  vehicleNo: "",
  licenseDate: "",
  insuranceDate: "",
  status: "1",
}

/** Map a loaded record into form values (number status -> string). */
export function toFleetFormValues(fleet: Fleet): FleetFormValues {
  return {
    businessId: fleet.businessId != null ? String(fleet.businessId) : "",
    assetId: fleet.assetId != null ? String(fleet.assetId) : "",
    vehicleNo: fleet.vehicleNo,
    licenseDate: fleet.licenseDate,
    insuranceDate: fleet.insuranceDate,
    status: String(fleet.status) as FleetFormValues["status"],
  }
}

/** Map submitted form values into the service input (string -> number). */
export function toFleetInput(values: FleetFormValues) {
  return {
    businessId: Number(values.businessId),
    assetId: Number(values.assetId),
    vehicleNo: values.vehicleNo.trim(),
    licenseDate: values.licenseDate.trim(),
    insuranceDate: values.insuranceDate.trim(),
    status: Number(values.status) as FleetStatus,
  }
}
