"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  RHFAutocomplete,
  RHFCurrencyInput,
  RHFDatePicker,
  RHFForm,
  RHFInput,
  RHFSelect,
  type Option,
} from "@/components/hook-form"
import { useAuth } from "@/context/AuthContext"
import {
  CashTransferApiError,
  createCashTransfer,
  updateCashTransfer,
} from "@/lib/cash-transfer-service"
import {
  cashTransferFormDefaults,
  cashTransferSchema,
  statusOptions,
  toCashTransferInput,
  type CashTransferFormValues,
} from "./cash-transfer-schema"
import { CASH_TRANSFER_LIST_PATH, CASH_TRANSFER_NEW_PATH } from "./constants"

/** Fresh empty form values (new date each call) for create mode. */
const freshDefaults = (): CashTransferFormValues => ({
  ...cashTransferFormDefaults,
  date: new Date(),
})

interface CashTransferFormProps {
  mode: "create" | "edit"
  cashTransferId?: number
  defaultValues: CashTransferFormValues
  /** Bank options for the from/to FK autocompletes (fetched server-side). */
  bankOptions: Option[]
}

/**
 * Shared create/edit form for a Cash Transfer. On create the server forces the
 * status to Finish, so the status field is only shown when editing. On success
 * it returns to the list and refreshes it.
 */
export function CashTransferForm({
  mode,
  cashTransferId,
  defaultValues,
  bankOptions,
}: CashTransferFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const isEdit = mode === "edit"

  const form = useForm<CashTransferFormValues>({
    resolver: zodResolver(cashTransferSchema),
    mode: "onBlur",
    defaultValues,
  })

  const onSubmit = React.useCallback(
    async (values: CashTransferFormValues) => {
      if (user == null) {
        form.setError("root", {
          type: "manual",
          message: "Your session has expired. Please sign in again.",
        })
        return
      }
      const input = toCashTransferInput(values, user.id)
      try {
        if (isEdit && cashTransferId != null) {
          await updateCashTransfer(cashTransferId, input)
          toast.success("Cash transfer updated.")
          // Update mode: switch to an empty New form after a successful save.
          router.push(CASH_TRANSFER_NEW_PATH)
          router.refresh()
        } else {
          await createCashTransfer(input)
          toast.success("Cash transfer created.")
          // Create mode: clear the form and stay on the New page (no redirect).
          form.reset(freshDefaults())
          router.refresh()
        }
      } catch (error) {
        if (
          error instanceof CashTransferApiError &&
          /from bank and to bank/i.test(error.message)
        ) {
          form.setError("toBank", { type: "manual", message: error.message })
          return
        }
        form.setError("root", {
          type: "manual",
          message:
            error instanceof CashTransferApiError
              ? error.message
              : "Something went wrong. Please try again.",
        })
      }
    },
    [isEdit, cashTransferId, router, form, user],
  )

  // Clear: in create mode reset to an empty form (stay); in edit mode switch
  // the page to New mode (empty create form).
  const handleClear = React.useCallback(() => {
    if (isEdit) {
      router.push(CASH_TRANSFER_NEW_PATH)
    } else {
      form.reset(freshDefaults())
    }
  }, [isEdit, router, form])

  // Print: only meaningful in edit mode — print the current record/form.
  const handlePrint = React.useCallback(() => {
    if (isEdit) {
      window.print()
    }
  }, [isEdit])

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm
      form={form}
      onSubmit={onSubmit}
      className="grid max-w-3xl gap-5 sm:grid-cols-2"
    >
      <RHFInput<CashTransferFormValues>
        name="cashTransfer"
        label="Cash Transfer No"
        disabled
        placeholder="Auto-generated on save"
        maxLength={15}
      />
      <RHFDatePicker<CashTransferFormValues>
        name="date"
        label="Date"
        required
        placeholder="Select date"
        triggerClassName="w-full"
      />
      <RHFAutocomplete<CashTransferFormValues>
        name="fromBank"
        label="From Bank"
        required
        options={bankOptions}
        placeholder="Select source bank"
        searchPlaceholder="Search banks..."
        triggerClassName="w-full"
      />
      <RHFAutocomplete<CashTransferFormValues>
        name="toBank"
        label="To Bank"
        required
        options={bankOptions}
        placeholder="Select destination bank"
        searchPlaceholder="Search banks..."
        triggerClassName="w-full"
      />
      <RHFCurrencyInput<CashTransferFormValues>
        name="value"
        label="Value"
        required
        placeholder="0.00"
      />
      <RHFInput<CashTransferFormValues>
        name="reference"
        label="Reference"
        placeholder="Optional"
        maxLength={100}
      />
      <RHFInput<CashTransferFormValues>
        name="description"
        label="Description"
        placeholder="Optional"
        maxLength={100}
        className="sm:col-span-2"
      />
      {isEdit && (
        <RHFSelect<CashTransferFormValues>
          name="status"
          label="Status"
          required
          options={statusOptions}
          triggerClassName="w-full"
        />
      )}

      {rootError && (
        <p className="text-sm text-destructive sm:col-span-2" role="alert">
          {rootError}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2 sm:col-span-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={handleClear}
        >
          Clear
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting || !isEdit}
          onClick={handlePrint}
        >
          Print
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => router.push(CASH_TRANSFER_LIST_PATH)}
        >
          List
        </Button>
      </div>
    </RHFForm>
  )
}
