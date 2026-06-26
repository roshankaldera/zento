"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { RHFForm, RHFInput, RHFSelect, RHFTextarea } from "@/components/hook-form"
import {
  createAccountCategory,
  DuplicateAccountCategoryNameError,
  updateAccountCategory,
} from "@/lib/account-category-service"
import {
  accountCategorySchema,
  statusOptions,
  toAccountCategoryInput,
  type AccountCategoryFormValues,
} from "./account-category-schema"
import { ACCOUNT_CATEGORY_LIST_PATH } from "./constants"

interface AccountCategoryFormProps {
  mode: "create" | "edit"
  accountCategoryId?: number
  defaultValues: AccountCategoryFormValues
}

/**
 * Shared create/edit form for an Account Category. Built entirely from the
 * reusable RHF field library; on success it returns to the list and refreshes it.
 */
export function AccountCategoryForm({
  mode,
  accountCategoryId,
  defaultValues,
}: AccountCategoryFormProps) {
  const router = useRouter()

  const form = useForm<AccountCategoryFormValues>({
    resolver: zodResolver(accountCategorySchema),
    mode: "onBlur",
    defaultValues,
  })

  const onSubmit = React.useCallback(
    async (values: AccountCategoryFormValues) => {
      const input = toAccountCategoryInput(values)
      try {
        if (mode === "edit" && accountCategoryId != null) {
          await updateAccountCategory(accountCategoryId, input)
          toast.success("Account category updated.")
        } else {
          await createAccountCategory(input)
          toast.success("Account category created.")
        }
        router.push(ACCOUNT_CATEGORY_LIST_PATH)
        router.refresh()
      } catch (error) {
        if (error instanceof DuplicateAccountCategoryNameError) {
          form.setError("name", {
            type: "manual",
            message: "An account category with this name already exists",
          })
          return
        }
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [mode, accountCategoryId, router, form],
  )

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid max-w-xl gap-5">
      <RHFInput<AccountCategoryFormValues>
        name="name"
        label="Name"
        required
        placeholder="Enter account category name"
        maxLength={50}
      />
      <RHFTextarea<AccountCategoryFormValues>
        name="remark"
        label="Remark"
        placeholder="Optional notes"
        maxLength={50}
      />
      <RHFSelect<AccountCategoryFormValues>
        name="status"
        label="Status"
        required
        options={statusOptions}
        triggerClassName="w-full sm:w-60"
      />

      {rootError && (
        <p className="text-sm text-destructive" role="alert">
          {rootError}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : mode === "edit" ? "Update" : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => router.push(ACCOUNT_CATEGORY_LIST_PATH)}
        >
          Cancel
        </Button>
      </div>
    </RHFForm>
  )
}
