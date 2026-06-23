import { format, parseISO } from "date-fns"
import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type { EmployeeLoan, EmployeeLoanStatus } from "@/types/employee-loan"

/**
 * Employee loan form contract. `employeeId` and `status` are committed as
 * strings (Radix Select / autocomplete only deal in strings); `issueDate` is a
 * real `Date`; the money/day fields are real numbers. `balance` is held in form
 * state but never user-edited — it is system-managed (initial balance = loan
 * value on create, unchanged on edit). Mapped back at the submit boundary.
 */
export const employeeLoanSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  issueDate: z.date().optional(),
  value: z
    .number({ error: "Loan amount is required" })
    .min(0, "Loan amount cannot be negative"),
  installment: z
    .number({ error: "Installment is required" })
    .min(0, "Installment cannot be negative"),
  dueDay: z
    .number({ error: "Due day is required" })
    .int("Due day must be a whole number")
    .min(1, "Due day must be between 1 and 31")
    .max(31, "Due day must be between 1 and 31"),
  balance: z.number(),
  status: z.enum(["1", "2", "3"]),
})

export type EmployeeLoanFormValues = z.infer<typeof employeeLoanSchema>

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
export const employeeLoanFormDefaults: EmployeeLoanFormValues = {
  employeeId: "",
  issueDate: undefined,
  value: 0,
  installment: 0,
  dueDay: 1,
  balance: 0,
  status: "1",
}

/** Map a loaded record into form values (numbers -> strings, ISO -> Date). */
export function toEmployeeLoanFormValues(
  loan: EmployeeLoan,
): EmployeeLoanFormValues {
  return {
    employeeId: String(loan.employeeId),
    issueDate: loan.issueDate ? parseISO(loan.issueDate.slice(0, 10)) : undefined,
    value: Number(loan.value),
    installment: Number(loan.installment),
    dueDay: loan.dueDay,
    balance: Number(loan.balance),
    status: String(loan.status) as EmployeeLoanFormValues["status"],
  }
}

/** Map submitted form values into the service input (strings -> domain types). */
export function toEmployeeLoanInput(values: EmployeeLoanFormValues) {
  return {
    employeeId: Number(values.employeeId),
    issueDate: values.issueDate ? format(values.issueDate, "yyyy-MM-dd") : null,
    value: values.value,
    installment: values.installment,
    dueDay: values.dueDay,
    balance: values.balance,
    status: Number(values.status) as EmployeeLoanStatus,
  }
}
