"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  RHFAutocomplete,
  RHFCurrencyInput,
  RHFDatePicker,
  RHFForm,
  RHFInput,
  RHFNumberInput,
  RHFSelect,
  RHFSwitch,
  type Option,
} from "@/components/hook-form"
import { createRent, updateRent } from "@/lib/rent-service"
import {
  rentSchema,
  statusOptions,
  toRentInput,
  type RentFormValues,
} from "./rent-schema"
import { RENT_LIST_PATH } from "./constants"

interface RentFormProps {
  mode: "create" | "edit"
  rentId?: number
  defaultValues: RentFormValues
  /** Business options for the FK autocomplete (fetched server-side). */
  businessOptions: Option[]
  /** Asset options for the FK autocomplete (fetched server-side). */
  assetOptions: Option[]
}

/**
 * Shared create/edit form for a Rent. Built from the reusable RHF field library;
 * on success it returns to the list and refreshes it.
 */
export function RentForm({
  mode,
  rentId,
  defaultValues,
  businessOptions,
  assetOptions,
}: RentFormProps) {
  const router = useRouter()

  const form = useForm<RentFormValues>({
    resolver: zodResolver(rentSchema),
    mode: "onBlur",
    defaultValues,
  })

  const onSubmit = React.useCallback(
    async (values: RentFormValues) => {
      const input = toRentInput(values)
      try {
        if (mode === "edit" && rentId != null) {
          await updateRent(rentId, input)
        } else {
          await createRent(input)
        }
        router.push(RENT_LIST_PATH)
        router.refresh()
      } catch {
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [mode, rentId, router, form],
  )

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm
      form={form}
      onSubmit={onSubmit}
      className="grid max-w-3xl gap-5 sm:grid-cols-2"
    >
      <RHFAutocomplete<RentFormValues>
        name="businessId"
        label="Business"
        required
        options={businessOptions}
        placeholder="Select a business"
        searchPlaceholder="Search businesses..."
        triggerClassName="w-full"
      />
      <RHFAutocomplete<RentFormValues>
        name="assetId"
        label="Asset"
        required
        options={assetOptions}
        placeholder="Select an asset"
        searchPlaceholder="Search assets..."
        triggerClassName="w-full"
      />
      <RHFInput<RentFormValues>
        name="tenant"
        label="Tenant"
        required
        placeholder="Enter tenant name"
        maxLength={100}
        className="sm:col-span-2"
      />
      <RHFDatePicker<RentFormValues>
        name="startDate"
        label="Start Date"
        required
        placeholder="Select start date"
        triggerClassName="w-full"
      />
      <RHFDatePicker<RentFormValues>
        name="endDate"
        label="End Date"
        required
        placeholder="Select end date"
        triggerClassName="w-full"
      />
      <RHFCurrencyInput<RentFormValues>
        name="rentValue"
        label="Rent Value"
        required
        placeholder="0.00"
      />
      <RHFNumberInput<RentFormValues>
        name="paymentDay"
        label="Payment Day (1-31)"
        required
        allowNegative={false}
        decimalScale={0}
        placeholder="1"
      />
      <RHFCurrencyInput<RentFormValues>
        name="advancedPayment"
        label="Advanced Payment"
        required
        placeholder="0.00"
      />
      <RHFCurrencyInput<RentFormValues>
        name="securityBond"
        label="Security Bond"
        required
        placeholder="0.00"
      />
      <RHFCurrencyInput<RentFormValues>
        name="whtValue"
        label="WHT Value"
        required
        placeholder="0.00"
      />
      <RHFSelect<RentFormValues>
        name="status"
        label="Status"
        required
        options={statusOptions}
        triggerClassName="w-full"
      />
      <RHFSwitch<RentFormValues>
        name="whtCertificateCollected"
        label="WHT Certificate Collected"
        className="sm:col-span-2"
      />

      {rootError && (
        <p className="text-sm text-destructive sm:col-span-2" role="alert">
          {rootError}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2 sm:col-span-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : mode === "edit" ? "Update" : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => router.push(RENT_LIST_PATH)}
        >
          Cancel
        </Button>
      </div>
    </RHFForm>
  )
}
