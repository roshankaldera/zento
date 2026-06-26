"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  RHFDatePicker,
  RHFForm,
  RHFNumberInput,
  RHFSelect,
} from "@/components/hook-form"
import {
  createExchangeRate,
  DuplicateExchangeRateError,
  updateExchangeRate,
} from "@/lib/exchange-rate-service"
import {
  currencyOptions,
  exchangeRateSchema,
  toExchangeRateInput,
  type ExchangeRateFormValues,
} from "./exchange-rate-schema"
import { EXCHANGE_RATE_LIST_PATH } from "./constants"

interface ExchangeRateFormProps {
  mode: "create" | "edit"
  exchangeRateId?: number
  defaultValues: ExchangeRateFormValues
}

/**
 * Shared create/edit form for an Exchange Rate. Currency + date must be unique.
 * On success it returns to the list and refreshes it.
 */
export function ExchangeRateForm({
  mode,
  exchangeRateId,
  defaultValues,
}: ExchangeRateFormProps) {
  const router = useRouter()

  const form = useForm<ExchangeRateFormValues>({
    resolver: zodResolver(exchangeRateSchema),
    mode: "onBlur",
    defaultValues,
  })

  const onSubmit = React.useCallback(
    async (values: ExchangeRateFormValues) => {
      const input = toExchangeRateInput(values)
      try {
        if (mode === "edit" && exchangeRateId != null) {
          await updateExchangeRate(exchangeRateId, input)
          toast.success("Exchange rate updated.")
        } else {
          await createExchangeRate(input)
          toast.success("Exchange rate created.")
        }
        router.push(EXCHANGE_RATE_LIST_PATH)
        router.refresh()
      } catch (error) {
        if (error instanceof DuplicateExchangeRateError) {
          form.setError("date", {
            type: "manual",
            message: "This currency already has a rate for this date",
          })
          return
        }
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [mode, exchangeRateId, router, form],
  )

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid max-w-xl gap-5">
      <RHFSelect<ExchangeRateFormValues>
        name="currencyId"
        label="Currency"
        required
        options={currencyOptions}
        triggerClassName="w-full sm:w-60"
      />
      <RHFDatePicker<ExchangeRateFormValues>
        name="date"
        label="Date"
        required
        placeholder="Select date"
        triggerClassName="w-full sm:w-60"
      />
      <RHFNumberInput<ExchangeRateFormValues>
        name="rate"
        label="Day Rate"
        required
        allowNegative={false}
        decimalScale={2}
        placeholder="0.00"
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
          onClick={() => router.push(EXCHANGE_RATE_LIST_PATH)}
        >
          Cancel
        </Button>
      </div>
    </RHFForm>
  )
}
