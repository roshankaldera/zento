"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  RHFAutocomplete,
  RHFForm,
  RHFInput,
  RHFMultiSelect,
  RHFPasswordInput,
  RHFSelect,
  type Option,
} from "@/components/hook-form"
import {
  createUser,
  DuplicateUserNameError,
  updateUser,
} from "@/lib/user-service"
import {
  statusOptions,
  toUserInput,
  userSchema,
  type UserFormValues,
} from "./user-schema"
import { USER_LIST_PATH } from "./constants"

interface UserFormProps {
  mode: "create" | "edit"
  userId?: number
  defaultValues: UserFormValues
  /** Business options for the default/accessible business fields. */
  businessOptions: Option[]
}

/**
 * Shared create/edit form for a User. The password is required on create and
 * optional on edit (blank keeps the current one). On success it returns to the
 * list and refreshes it.
 */
export function UserForm({
  mode,
  userId,
  defaultValues,
  businessOptions,
}: UserFormProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    mode: "onBlur",
    defaultValues,
  })

  const onSubmit = React.useCallback(
    async (values: UserFormValues) => {
      // Password is required on create (optional on edit).
      if (!isEdit && !values.password?.trim()) {
        form.setError("password", {
          type: "manual",
          message: "Password is required",
        })
        return
      }

      const input = toUserInput(values)
      try {
        if (isEdit && userId != null) {
          await updateUser(userId, input)
        } else {
          await createUser(input)
        }
        router.push(USER_LIST_PATH)
        router.refresh()
      } catch (error) {
        if (error instanceof DuplicateUserNameError) {
          form.setError("userName", {
            type: "manual",
            message: "A user with this user name already exists",
          })
          return
        }
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [isEdit, userId, router, form],
  )

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid max-w-xl gap-5">
      <RHFInput<UserFormValues>
        name="fullName"
        label="Name"
        required
        placeholder="Enter full name"
        maxLength={100}
      />
      <RHFInput<UserFormValues>
        name="userName"
        label="User Name"
        required
        placeholder="Enter user name"
        maxLength={100}
      />
      <RHFPasswordInput<UserFormValues>
        name="password"
        label="Password"
        required={!isEdit}
        placeholder={isEdit ? "Leave blank to keep current" : "Enter password"}
        description={
          isEdit ? "Leave blank to keep the current password." : undefined
        }
        maxLength={100}
      />
      <RHFAutocomplete<UserFormValues>
        name="defaultBusiness"
        label="Default Business"
        options={businessOptions}
        placeholder="Select a default business (optional)"
        searchPlaceholder="Search businesses..."
        triggerClassName="w-full sm:w-80"
      />
      <RHFMultiSelect<UserFormValues>
        name="accessibleBusinesses"
        label="Accessible Businesses"
        required
        options={businessOptions}
        placeholder="Select accessible businesses"
        searchPlaceholder="Search businesses..."
        triggerClassName="w-full"
      />
      <RHFSelect<UserFormValues>
        name="status"
        label="Status"
        required
        options={statusOptions}
        triggerClassName="w-full sm:w-60"
      />
      <RHFInput<UserFormValues>
        name="remark"
        label="Remark"
        placeholder="Optional notes"
        maxLength={100}
      />

      {rootError && (
        <p className="text-sm text-destructive" role="alert">
          {rootError}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Update" : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => router.push(USER_LIST_PATH)}
        >
          Cancel
        </Button>
      </div>
    </RHFForm>
  )
}
