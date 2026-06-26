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
  RHFNumberInput,
  type Option,
} from "@/components/hook-form"
import {
  createOtherHarvest,
  updateOtherHarvest,
} from "@/lib/other-harvest-service"
import {
  otherHarvestFormDefaults,
  otherHarvestSchema,
  toOtherHarvestInput,
  type OtherHarvestFormValues,
} from "./other-harvest-schema"
import { OTHER_HARVEST_LIST_PATH, OTHER_HARVEST_NEW_PATH } from "./constants"

/** Fresh empty form values for create mode. */
const freshDefaults = (): OtherHarvestFormValues => ({
  ...otherHarvestFormDefaults,
  date: new Date(),
})

interface OtherHarvestFormProps {
  mode: "create" | "edit"
  otherHarvestId?: number
  defaultValues: OtherHarvestFormValues
  /** Estate options (businesses of type 1) for the FK autocomplete. */
  estateOptions: Option[]
  /** Supplier options for the FK autocomplete. */
  supplierOptions: Option[]
  /** Crop options for the FK autocomplete. */
  cropOptions: Option[]
}

/**
 * Shared create/edit form for an Other Harvest. Built from the reusable RHF
 * field library; on success it returns to the list and refreshes it.
 */
export function OtherHarvestForm({
  mode,
  otherHarvestId,
  defaultValues,
  estateOptions,
  supplierOptions,
  cropOptions,
}: OtherHarvestFormProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const form = useForm<OtherHarvestFormValues>({
    resolver: zodResolver(otherHarvestSchema),
    mode: "onBlur",
    defaultValues,
  })

  const onSubmit = React.useCallback(
    async (values: OtherHarvestFormValues) => {
      const input = toOtherHarvestInput(values)
      try {
        if (isEdit && otherHarvestId != null) {
          await updateOtherHarvest(otherHarvestId, input)
          toast.success("Other harvest updated.")
          // Update mode: switch to an empty New form after a successful save.
          router.push(OTHER_HARVEST_NEW_PATH)
          router.refresh()
        } else {
          await createOtherHarvest(input)
          toast.success("Other harvest created.")
          // Create mode: clear the form and stay on the New page (no redirect).
          form.reset(freshDefaults())
          router.refresh()
        }
      } catch {
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [isEdit, otherHarvestId, router, form],
  )

  // Clear: in create mode reset to an empty form (stay); in edit mode switch
  // the page to New mode (empty create form).
  const handleClear = React.useCallback(() => {
    if (isEdit) {
      router.push(OTHER_HARVEST_NEW_PATH)
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
      <RHFDatePicker<OtherHarvestFormValues>
        name="date"
        label="Date"
        required
        placeholder="Select date"
        triggerClassName="w-full"
      />
      <RHFAutocomplete<OtherHarvestFormValues>
        name="estateId"
        label="Estate"
        required
        options={estateOptions}
        placeholder="Select an estate"
        searchPlaceholder="Search estates..."
        triggerClassName="w-full"
      />
      <RHFAutocomplete<OtherHarvestFormValues>
        name="supplierId"
        label="Supplier"
        required
        options={supplierOptions}
        placeholder="Select a supplier"
        searchPlaceholder="Search suppliers..."
        triggerClassName="w-full"
      />
      <RHFAutocomplete<OtherHarvestFormValues>
        name="cropId"
        label="Crop"
        required
        options={cropOptions}
        placeholder="Select a crop"
        searchPlaceholder="Search crops..."
        triggerClassName="w-full"
      />
      <RHFNumberInput<OtherHarvestFormValues>
        name="quantity"
        label="Quantity"
        required
        allowNegative={false}
        decimalScale={2}
        placeholder="0.00"
      />
      <RHFCurrencyInput<OtherHarvestFormValues>
        name="value"
        label="Value"
        required
        placeholder="0.00"
      />
      <RHFInput<OtherHarvestFormValues>
        name="reference"
        label="Reference"
        placeholder="Optional"
        maxLength={100}
      />
      <RHFInput<OtherHarvestFormValues>
        name="remark"
        label="Remark"
        placeholder="Optional"
        maxLength={100}
      />

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
          onClick={() => router.push(OTHER_HARVEST_LIST_PATH)}
        >
          List
        </Button>
      </div>
    </RHFForm>
  )
}
