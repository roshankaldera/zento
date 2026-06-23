import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type { User, UserStatus } from "@/types/user"

/**
 * User form contract. `defaultBusiness` and `status` are committed as strings
 * (Radix Select / autocomplete); `accessibleBusinesses` is a string[] of
 * business ids (multi-select). `password` is optional here — required-on-create
 * is enforced in the form; on edit a blank value keeps the current password.
 */
export const userSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer"),
  userName: z
    .string()
    .trim()
    .min(1, "User name is required")
    .max(100, "User name must be 100 characters or fewer"),
  password: z
    .string()
    .max(100, "Password must be 100 characters or fewer")
    .optional(),
  defaultBusiness: z.string().optional(),
  accessibleBusinesses: z
    .array(z.string())
    .min(1, "Select at least one accessible business"),
  status: z.enum(["1", "2"]),
  remark: z
    .string()
    .trim()
    .max(100, "Remark must be 100 characters or fewer")
    .optional(),
})

export type UserFormValues = z.infer<typeof userSchema>

/** Status dropdown options (value matches the tinyint stored in the DB). */
export const statusOptions: Option[] = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "2" },
]

/** Default values for the create form. */
export const userFormDefaults: UserFormValues = {
  fullName: "",
  userName: "",
  password: "",
  defaultBusiness: "",
  accessibleBusinesses: [],
  status: "1",
  remark: "",
}

/** Map a loaded record into form values (numbers -> strings; password blank). */
export function toUserFormValues(user: User): UserFormValues {
  return {
    fullName: user.fullName,
    userName: user.userName,
    // Never prefill the (hashed) password — blank means "keep current".
    password: "",
    defaultBusiness:
      user.defaultBusiness != null ? String(user.defaultBusiness) : "",
    accessibleBusinesses: user.accessibleBusinesses.map(String),
    status: String(user.status) as UserFormValues["status"],
    remark: user.remark ?? "",
  }
}

/** Map submitted form values into the service input (strings -> numbers). */
export function toUserInput(values: UserFormValues) {
  const password = values.password?.trim()
  return {
    fullName: values.fullName.trim(),
    userName: values.userName.trim(),
    password: password ? password : undefined,
    defaultBusiness: values.defaultBusiness
      ? Number(values.defaultBusiness)
      : null,
    accessibleBusinesses: values.accessibleBusinesses.map(Number),
    status: Number(values.status) as UserStatus,
    remark: values.remark?.trim() ? values.remark.trim() : null,
  }
}
