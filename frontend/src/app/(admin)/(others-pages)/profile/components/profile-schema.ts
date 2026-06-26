import { z } from "zod"

/**
 * Profile details the signed-in user can edit themselves. Matches the User
 * record's `fullName` / `remark` constraints (see master/user/user-schema.ts).
 */
export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name must be 100 characters or fewer"),
  remark: z
    .string()
    .trim()
    .max(100, "Remark must be 100 characters or fewer")
    .optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

/**
 * Password change contract. `newPassword` and `confirmPassword` must match;
 * the mismatch is reported on the confirm field.
 */
export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .max(100, "Password must be 100 characters or fewer"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

export type PasswordFormValues = z.infer<typeof passwordSchema>

/** Defaults for the password card (always starts blank). */
export const passwordFormDefaults: PasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
}
