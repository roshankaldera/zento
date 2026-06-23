import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type { Account, AccountStatus } from "@/types/account"

/**
 * Account form contract. `groupId` and `status` are committed as strings
 * (Radix Select only deals in strings); they are mapped back to numbers at the
 * submit boundary (see `toAccountInput`).
 */
export const accountSchema = z.object({
  businessId: z.string().min(1, "Business is required"),
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(20, "Code must be 20 characters or fewer"),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(20, "Name must be 20 characters or fewer"),
  groupId: z.string().min(1, "Group is required"),
  status: z.enum(["1", "2"]),
})

export type AccountFormValues = z.infer<typeof accountSchema>

/** Status dropdown options (value matches the tinyint stored in the DB). */
export const statusOptions: Option[] = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "2" },
]

/** Default values for the create form. */
export const accountFormDefaults: AccountFormValues = {
  businessId: "",
  code: "",
  name: "",
  groupId: "",
  status: "1",
}

/** Map a loaded record into form values (number group/status -> string). */
export function toAccountFormValues(account: Account): AccountFormValues {
  return {
    businessId: String(account.businessId),
    code: account.code,
    name: account.name,
    groupId: String(account.groupId),
    status: String(account.status) as AccountFormValues["status"],
  }
}

/** Map submitted form values into the service input (string -> number). */
export function toAccountInput(values: AccountFormValues) {
  return {
    businessId: Number(values.businessId),
    code: values.code.trim(),
    name: values.name.trim(),
    groupId: Number(values.groupId),
    status: Number(values.status) as AccountStatus,
  }
}
