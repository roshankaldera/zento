import { format, parseISO } from "date-fns"
import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type { Leave, LeavePeriod } from "@/types/leave"

/**
 * Leave form contract. `employeeId` and `period` are committed as strings (Radix
 * Select / autocomplete only deal in strings); `date` is a real `Date` (Radix
 * date picker). Everything is mapped back to its domain type at the submit
 * boundary (see `toLeaveInput`).
 */
export const leaveSchema = z.object({
  date: z.date({ error: "Date is required" }),
  employeeId: z.string().min(1, "Employee is required"),
  period: z.enum(["1", "2"]),
  reason: z
    .string()
    .trim()
    .max(100, "Reason must be 100 characters or fewer")
    .optional(),
})

export type LeaveFormValues = z.infer<typeof leaveSchema>

/** Period dropdown options (value matches the tinyint stored in the DB). */
export const periodOptions: Option[] = [
  { label: "Fullday", value: "1" },
  { label: "Halfday", value: "2" },
]

/** Human label for a stored period. */
export const periodLabel = (period: number): string =>
  periodOptions.find((o) => o.value === String(period))?.label ?? "—"

/** Default values for the create form. */
export const leaveFormDefaults: LeaveFormValues = {
  // Validation enforces a real date on submit; the picker handles `undefined`.
  date: undefined as unknown as Date,
  employeeId: "",
  period: "1",
  reason: "",
}

/** Map a loaded record into form values (numbers -> strings, ISO -> Date). */
export function toLeaveFormValues(leave: Leave): LeaveFormValues {
  return {
    date: parseISO(leave.date.slice(0, 10)),
    employeeId: String(leave.employeeId),
    period: String(leave.period) as LeaveFormValues["period"],
    reason: leave.reason ?? "",
  }
}

/** Map submitted form values into the service input (strings -> domain types). */
export function toLeaveInput(values: LeaveFormValues) {
  const reason = values.reason?.trim()
  return {
    date: format(values.date, "yyyy-MM-dd"),
    employeeId: Number(values.employeeId),
    period: Number(values.period) as LeavePeriod,
    reason: reason ? reason : null,
  }
}
