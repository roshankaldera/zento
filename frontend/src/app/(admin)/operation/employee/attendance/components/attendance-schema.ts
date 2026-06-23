import { format, parseISO } from "date-fns"
import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type {
  Attendance,
  AttendanceLineStatus,
  AttendanceShift,
} from "@/types/attendance"

/**
 * One attendance line. `employeeId`, `shift` and `status` are committed as
 * strings (Radix Select / autocomplete only deal in strings); `hours` is a real
 * number and may include a fraction (e.g. 8.5 = 8h 30m). Everything is mapped
 * back to its domain type at the submit boundary (see `toAttendanceInput`).
 */
const lineSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  shift: z.enum(["1", "2", "3"]),
  hours: z
    .number({ error: "Hours is required" })
    .min(0, "Hours cannot be negative")
    .max(24, "Hours cannot exceed 24"),
  status: z.enum(["1", "2", "3", "4"]),
  remark: z
    .string()
    .trim()
    .max(100, "Remark must be 100 characters or fewer")
    .optional(),
})

/**
 * Attendance form contract. `businessId` is a string; `date` is a real `Date`
 * (Radix date picker); `lines` always holds at least one row.
 */
export const attendanceSchema = z.object({
  businessId: z.string().min(1, "Business is required"),
  date: z.date({ error: "Date is required" }),
  remark: z
    .string()
    .trim()
    .max(100, "Remark must be 100 characters or fewer")
    .optional(),
  lines: z.array(lineSchema).min(1, "Add at least one line"),
})

export type AttendanceFormValues = z.infer<typeof attendanceSchema>
export type AttendanceLineFormValues = z.infer<typeof lineSchema>

/**
 * An employee choice for a line, tagged with its owning business and status so
 * the form can scope the roster to the selected business's *active* employees.
 */
export interface AttendanceEmployeeOption {
  value: string
  label: string
  businessId: number
  /** 1 = Active, 2 = Inactive. */
  status: number
}

/** Shift dropdown options (value matches the tinyint stored in the DB). */
export const shiftOptions: Option[] = [
  { label: "Full Day", value: "1" },
  { label: "Day", value: "2" },
  { label: "Night", value: "3" },
]

/** Human label for a stored shift. */
export const shiftLabel = (shift: number): string =>
  shiftOptions.find((o) => o.value === String(shift))?.label ?? "—"

/** Per-line status dropdown options (value matches the tinyint stored in the DB). */
export const lineStatusOptions: Option[] = [
  { label: "Pending", value: "1" },
  { label: "Present", value: "2" },
  { label: "Absent", value: "3" },
  { label: "Off", value: "4" },
]

/** Human label for a stored line status. */
export const lineStatusLabel = (status: number): string =>
  lineStatusOptions.find((o) => o.value === String(status))?.label ?? "—"

/** A blank line, appended whenever the user clicks "Add line". */
export const emptyAttendanceLine: AttendanceLineFormValues = {
  employeeId: "",
  shift: "1",
  hours: 0,
  status: "1",
  remark: "",
}

/** Default values for the create form (one empty line to start). */
export const attendanceFormDefaults: AttendanceFormValues = {
  businessId: "",
  // Validation enforces a real date on submit; the picker handles `undefined`.
  date: undefined as unknown as Date,
  remark: "",
  lines: [{ ...emptyAttendanceLine }],
}

/** Map a loaded record into form values (numbers -> strings, ISO -> Date). */
export function toAttendanceFormValues(
  attendance: Attendance,
): AttendanceFormValues {
  return {
    businessId: String(attendance.businessId),
    date: parseISO(attendance.date.slice(0, 10)),
    remark: attendance.remark ?? "",
    lines: (attendance.lines ?? []).map((line) => ({
      employeeId: String(line.employeeId),
      shift: String(line.shift) as AttendanceLineFormValues["shift"],
      hours: Number(line.hours),
      status: String(line.status) as AttendanceLineFormValues["status"],
      remark: line.remark ?? "",
    })),
  }
}

/** Map submitted form values into the service input (strings -> domain types). */
export function toAttendanceInput(values: AttendanceFormValues) {
  const remark = values.remark?.trim()
  return {
    businessId: Number(values.businessId),
    date: format(values.date, "yyyy-MM-dd"),
    remark: remark ? remark : null,
    lines: values.lines.map((line) => {
      const lineRemark = line.remark?.trim()
      return {
        employeeId: Number(line.employeeId),
        shift: Number(line.shift) as AttendanceShift,
        hours: line.hours,
        status: Number(line.status) as AttendanceLineStatus,
        remark: lineRemark ? lineRemark : null,
      }
    }),
  }
}
