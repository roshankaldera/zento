import { format, parseISO } from "date-fns"
import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type {
  Employee,
  EmployeeAttendType,
  EmployeeStatus,
} from "@/types/employee"

/**
 * Employee form contract. `businessId`, `attendType` and `status` are committed
 * as strings because Radix Select only deals in strings; `dob` is a real `Date`
 * (Radix date picker). Everything is mapped back to its domain type at the
 * submit boundary (see `toEmployeeInput`).
 */
export const employeeSchema = z.object({
  businessId: z.string().min(1, "Business is required"),
  empNo: z
    .string()
    .trim()
    .min(1, "Employee number is required")
    .max(20, "Employee number must be 20 characters or fewer"),
  nic: z
    .string()
    .trim()
    .min(1, "NIC is required")
    .max(12, "NIC must be 12 characters or fewer"),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer"),
  mobile1: z
    .string()
    .trim()
    .max(10, "Mobile must be 10 characters or fewer")
    .optional(),
  mobile2: z
    .string()
    .trim()
    .max(10, "Mobile must be 10 characters or fewer")
    .optional(),
  address: z
    .string()
    .trim()
    .max(100, "Address must be 100 characters or fewer")
    .optional(),
  dob: z.date().optional(),
  attendType: z.enum(["1", "2"]),
  status: z.enum(["1", "2"]),
})

export type EmployeeFormValues = z.infer<typeof employeeSchema>

/** Attendance type dropdown options (value matches the tinyint stored in the DB). */
export const attendTypeOptions: Option[] = [
  { label: "Shift", value: "1" },
  { label: "Hourly", value: "2" },
]

/** Human label for a stored attendance type. */
export const attendTypeLabel = (type: number): string =>
  attendTypeOptions.find((o) => o.value === String(type))?.label ?? "—"

/** Status dropdown options (value matches the tinyint stored in the DB). */
export const statusOptions: Option[] = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "2" },
]

/** Default values for the create form. */
export const employeeFormDefaults: EmployeeFormValues = {
  businessId: "",
  empNo: "",
  nic: "",
  name: "",
  mobile1: "",
  mobile2: "",
  address: "",
  dob: undefined,
  attendType: "1",
  status: "1",
}

/** Map a loaded record into form values (numbers -> strings, ISO -> Date). */
export function toEmployeeFormValues(employee: Employee): EmployeeFormValues {
  return {
    businessId: String(employee.businessId),
    empNo: employee.empNo,
    nic: employee.nic,
    name: employee.name,
    mobile1: employee.mobile1 ?? "",
    mobile2: employee.mobile2 ?? "",
    address: employee.address ?? "",
    // Parse the date-only portion so the calendar day is timezone-stable.
    dob: employee.dob ? parseISO(employee.dob.slice(0, 10)) : undefined,
    attendType: String(employee.attendType) as EmployeeFormValues["attendType"],
    status: String(employee.status) as EmployeeFormValues["status"],
  }
}

/** Map submitted form values into the service input (strings -> domain types). */
export function toEmployeeInput(values: EmployeeFormValues) {
  return {
    businessId: Number(values.businessId),
    empNo: values.empNo,
    nic: values.nic,
    name: values.name,
    mobile1: values.mobile1 ?? "",
    mobile2: values.mobile2 ?? "",
    address: values.address ?? "",
    // Send a timezone-neutral date-only string.
    dob: values.dob ? format(values.dob, "yyyy-MM-dd") : null,
    attendType: Number(values.attendType) as EmployeeAttendType,
    status: Number(values.status) as EmployeeStatus,
  }
}
