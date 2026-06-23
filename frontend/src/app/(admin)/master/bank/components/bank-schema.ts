import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type { Bank, BankStatus, BankType } from "@/types/bank"

/**
 * Bank form contract. `businessId`, `type` and `status` are committed as strings
 * (Radix Select); `cashFloat`/`balance` are numbers (currency input). Everything
 * is mapped back to its domain type at the submit boundary (see `toBankInput`),
 * which also enforces the type-based field rule (see below).
 */
export const bankSchema = z.object({
  businessId: z.string().min(1, "Business is required"),
  type: z.enum(["1", "2"]),
  bank: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(20, "Must be 20 characters or fewer"),
  branch: z
    .string()
    .trim()
    .max(20, "Must be 20 characters or fewer")
    .optional(),
  accountNo: z
    .string()
    .trim()
    .max(20, "Must be 20 characters or fewer")
    .optional(),
  cashFloat: z.number().min(0, "Must be 0 or more").optional(),
  balance: z.number().optional(),
  status: z.enum(["1", "2"]),
})

export type BankFormValues = z.infer<typeof bankSchema>

/** Type dropdown options (value matches the tinyint stored in the DB). */
export const typeOptions: Option[] = [
  { label: "Bank", value: "1" },
  { label: "Petty Cash", value: "2" },
]

/** Human label for a stored bank type. */
export const bankTypeLabel = (type: number): string =>
  typeOptions.find((o) => o.value === String(type))?.label ?? "—"

/** Status dropdown options (value matches the tinyint stored in the DB). */
export const statusOptions: Option[] = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "2" },
]

/** Default values for the create form. */
export const bankFormDefaults: BankFormValues = {
  businessId: "",
  type: "1",
  bank: "",
  branch: "",
  accountNo: "",
  cashFloat: 0,
  balance: 0,
  status: "1",
}

/** Map a loaded record into form values (numbers/decimals -> form types). */
export function toBankFormValues(bank: Bank): BankFormValues {
  return {
    businessId: String(bank.businessId),
    type: String(bank.type) as BankFormValues["type"],
    bank: bank.bank,
    branch: bank.branch ?? "",
    accountNo: bank.accountNo ?? "",
    cashFloat: Number(bank.cashFloat),
    balance: Number(bank.balance),
    status: String(bank.status) as BankFormValues["status"],
  }
}

/**
 * Map submitted form values into the service input. Enforces the business rule:
 * `branch`/`accountNo` apply only to type 1 (Bank); `cashFloat` applies only to
 * type 2 (Petty Cash). Irrelevant fields are normalised away.
 */
export function toBankInput(values: BankFormValues) {
  const type = Number(values.type) as BankType
  const isBank = type === 1
  return {
    businessId: Number(values.businessId),
    type,
    bank: values.bank,
    branch: isBank ? (values.branch ?? "") : "",
    accountNo: isBank ? (values.accountNo ?? "") : "",
    cashFloat: isBank ? 0 : (values.cashFloat ?? 0),
    balance: values.balance ?? 0,
    status: Number(values.status) as BankStatus,
  }
}
