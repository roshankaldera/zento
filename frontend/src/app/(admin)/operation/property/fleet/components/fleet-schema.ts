import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type { Fleet, FleetStatus } from "@/types/fleet"

/** mm/dd — month 01-12, day 01-31 (recurring renewal day, no year). */
export const MM_DD = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/

/**
 * Fleet form contract. `status` is committed as a string (Radix Select);
 * `licenseDate`/`insuranceDate` are mm/dd text strings validated by regex.
 */
export const fleetSchema = z.object({
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
  vehicleNo: "",
  licenseDate: "",
  insuranceDate: "",
  status: "1",
}

/** Map a loaded record into form values (number status -> string). */
export function toFleetFormValues(fleet: Fleet): FleetFormValues {
  return {
    vehicleNo: fleet.vehicleNo,
    licenseDate: fleet.licenseDate,
    insuranceDate: fleet.insuranceDate,
    status: String(fleet.status) as FleetFormValues["status"],
  }
}

/** Map submitted form values into the service input (string -> number). */
export function toFleetInput(values: FleetFormValues) {
  return {
    vehicleNo: values.vehicleNo.trim(),
    licenseDate: values.licenseDate.trim(),
    insuranceDate: values.insuranceDate.trim(),
    status: Number(values.status) as FleetStatus,
  }
}
