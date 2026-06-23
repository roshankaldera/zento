"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { RHFForm, RHFInput, RHFSelect, type Option } from "@/components/hook-form"
import {
  createAccount,
  DuplicateAccountError,
  updateAccount,
} from "@/lib/account-service"
import {
  accountSchema,
  statusOptions,
  toAccountInput,
  type AccountFormValues,
} from "./account-schema"
import { ACCOUNT_LIST_PATH } from "./constants"

interface AccountFormProps {
  mode: "create" | "edit"
  accountId?: number
  defaultValues: AccountFormValues
  /** Business options for the FK select (fetched server-side). */
  businessOptions: Option[]
  /** Group options (account categories) for the FK select. */
  groupOptions: Option[]
}

/**
 * Shared create/edit form for an Account. Built from the reusable RHF field
 * library; on success it returns to the list and refreshes it.
 */
export function AccountForm({
  mode,
  accountId,
  defaultValues,
  businessOptions,
  groupOptions,
}: AccountFormProps) {
  const router = useRouter()

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    mode: "onBlur",
    defaultValues,
  })

  const onSubmit = React.useCallback(
    async (values: AccountFormValues) => {
      const input = toAccountInput(values)
      try {
        if (mode === "edit" && accountId != null) {
          await updateAccount(accountId, input)
        } else {
          await createAccount(input)
        }
        router.push(ACCOUNT_LIST_PATH)
        router.refresh()
      } catch (error) {
        if (error instanceof DuplicateAccountError) {
          const field = /code/i.test(error.message) ? "code" : "name"
          form.setError(field, { type: "manual", message: error.message })
          return
        }
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [mode, accountId, router, form],
  )

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid max-w-xl gap-5">
      <RHFSelect<AccountFormValues>
        name="businessId"
        label="Business"
        required
        options={businessOptions}
        placeholder="Select a business"
        triggerClassName="w-full sm:w-60"
      />
      <RHFInput<AccountFormValues>
        name="code"
        label="Code"
        required
        placeholder="Enter account code"
        maxLength={20}
      />
      <RHFInput<AccountFormValues>
        name="name"
        label="Name"
        required
        placeholder="Enter account name"
        maxLength={20}
      />
      <RHFSelect<AccountFormValues>
        name="groupId"
        label="Group"
        required
        options={groupOptions}
        placeholder="Select a group"
        triggerClassName="w-full sm:w-60"
      />
      <RHFSelect<AccountFormValues>
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
          onClick={() => router.push(ACCOUNT_LIST_PATH)}
        >
          Cancel
        </Button>
      </div>
    </RHFForm>
  )
}
