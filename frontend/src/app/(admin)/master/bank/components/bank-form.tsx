"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  RHFCurrencyInput,
  RHFForm,
  RHFInput,
  RHFSelect,
  type Option,
} from "@/components/hook-form"
import { createBank, updateBank } from "@/lib/bank-service"
import {
  bankSchema,
  statusOptions,
  toBankInput,
  typeOptions,
  type BankFormValues,
} from "./bank-schema"
import { BANK_LIST_PATH } from "./constants"

interface BankFormProps {
  mode: "create" | "edit"
  bankId?: number
  defaultValues: BankFormValues
  /** Business options for the FK select (fetched server-side). */
  businessOptions: Option[]
}

/**
 * Shared create/edit form for a Bank. Implements the business rule: type 1
 * (Bank) shows branch + account number; type 2 (Petty Cash) shows the cash
 * float. Built entirely from the reusable RHF field library.
 */
export function BankForm({
  mode,
  bankId,
  defaultValues,
  businessOptions,
}: BankFormProps) {
  const router = useRouter()

  const form = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema),
    mode: "onBlur",
    defaultValues,
  })

  // Drive conditional field visibility off the selected type. `useWatch` is the
  // memoization-safe subscription API (unlike `form.watch`).
  const type = useWatch({ control: form.control, name: "type" })
  const isBank = type === "1"

  const onSubmit = React.useCallback(
    async (values: BankFormValues) => {
      const input = toBankInput(values)
      try {
        if (mode === "edit" && bankId != null) {
          await updateBank(bankId, input)
        } else {
          await createBank(input)
        }
        router.push(BANK_LIST_PATH)
        router.refresh()
      } catch {
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [mode, bankId, router, form],
  )

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid max-w-xl gap-5">
      <RHFSelect<BankFormValues>
        name="businessId"
        label="Business"
        required
        options={businessOptions}
        placeholder="Select a business"
        triggerClassName="w-full sm:w-60"
      />
      <RHFSelect<BankFormValues>
        name="type"
        label="Type"
        required
        options={typeOptions}
        triggerClassName="w-full sm:w-60"
      />
      <RHFInput<BankFormValues>
        name="bank"
        label={isBank ? "Bank Name" : "Person Name"}
        required
        placeholder={isBank ? "Enter bank name" : "Enter person name"}
        maxLength={20}
      />

      {isBank ? (
        <>
          <RHFInput<BankFormValues>
            name="branch"
            label="Branch Name"
            placeholder="Optional branch name"
            maxLength={20}
          />
          <RHFInput<BankFormValues>
            name="accountNo"
            label="Account No"
            placeholder="Optional account number"
            maxLength={20}
          />
        </>
      ) : (
        <RHFCurrencyInput<BankFormValues>
          name="cashFloat"
          label="Petty Cash Float"
          placeholder="0.00"
        />
      )}

      <RHFCurrencyInput<BankFormValues>
        name="balance"
        label="Balance"
        placeholder="0.00"
      />
      <RHFSelect<BankFormValues>
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
          onClick={() => router.push(BANK_LIST_PATH)}
        >
          Cancel
        </Button>
      </div>
    </RHFForm>
  )
}
