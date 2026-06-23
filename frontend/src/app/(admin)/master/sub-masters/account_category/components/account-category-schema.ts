import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type {
  AccountCategory,
  AccountCategoryStatus,
} from "@/types/account-category"

/**
 * Account Category form contract. `status` is committed as a string because
 * Radix Select only deals in strings; it is mapped back to the numeric
 * {@link AccountCategoryStatus} at the submit boundary (see `toAccountCategoryInput`).
 */
export const accountCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Account category name is required")
    .max(50, "Name must be 50 characters or fewer"),
  remark: z
    .string()
    .trim()
    .max(50, "Remark must be 50 characters or fewer")
    .optional(),
  status: z.enum(["1", "2"]),
})

export type AccountCategoryFormValues = z.infer<typeof accountCategorySchema>

/** Status dropdown options (value matches the tinyint stored in the DB). */
export const statusOptions: Option[] = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "2" },
]

/** Default values for the create form. */
export const accountCategoryFormDefaults: AccountCategoryFormValues = {
  name: "",
  remark: "",
  status: "1",
}

/** Map a loaded record into form values (number status -> string). */
export function toAccountCategoryFormValues(
  accountCategory: AccountCategory,
): AccountCategoryFormValues {
  return {
    name: accountCategory.name,
    remark: accountCategory.remark ?? "",
    status: String(
      accountCategory.status,
    ) as AccountCategoryFormValues["status"],
  }
}

/** Map submitted form values into the service input (string status -> number). */
export function toAccountCategoryInput(values: AccountCategoryFormValues) {
  return {
    name: values.name,
    remark: values.remark ?? "",
    status: Number(values.status) as AccountCategoryStatus,
  }
}
