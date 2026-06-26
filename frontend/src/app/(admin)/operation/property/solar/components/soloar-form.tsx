"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  RHFAutocomplete,
  RHFDatePicker,
  RHFForm,
  RHFNumberInput,
  RHFSelect,
  type Option,
} from "@/components/hook-form"
import { createSoloar, updateSoloar } from "@/lib/soloar-service"
import {
  soloarSchema,
  toSoloarInput,
  type BusinessScopedOption,
  type SoloarFormValues,
} from "./soloar-schema"
import { SOLOAR_LIST_PATH } from "./constants"

interface SoloarFormProps {
  mode: "create" | "edit"
  soloarId?: number
  defaultValues: SoloarFormValues
  /** Business options for the top dropdown (fetched server-side). */
  businessOptions: Option[]
  /** Solar asset options, tagged with their business for client-side scoping. */
  soloarOptions: BusinessScopedOption[]
}

/**
 * Shared create/edit form for a Soloar meter reading. On success it returns to
 * the list and refreshes it.
 */
export function SoloarForm({
  mode,
  soloarId,
  defaultValues,
  businessOptions,
  soloarOptions,
}: SoloarFormProps) {
  const router = useRouter()

  const form = useForm<SoloarFormValues>({
    resolver: zodResolver(soloarSchema),
    mode: "onBlur",
    defaultValues,
  })

  const onSubmit = React.useCallback(
    async (values: SoloarFormValues) => {
      const input = toSoloarInput(values)
      try {
        if (mode === "edit" && soloarId != null) {
          await updateSoloar(soloarId, input)
          toast.success("Solar reading updated.")
        } else {
          await createSoloar(input)
          toast.success("Solar reading created.")
        }
        router.push(SOLOAR_LIST_PATH)
        router.refresh()
      } catch {
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [mode, soloarId, router, form],
  )

  // The solar-asset list is scoped to the selected business. Filtering is done
  // client-side off the pre-fetched, business-tagged option list.
  const selectedBusinessId = useWatch({
    control: form.control,
    name: "businessId",
  })
  const filteredSoloarOptions = React.useMemo(
    () =>
      selectedBusinessId
        ? soloarOptions.filter(
            (o) => String(o.businessId) === selectedBusinessId,
          )
        : [],
    [soloarOptions, selectedBusinessId],
  )

  // When the business changes, clear the solar asset that belonged to the
  // previous business so a stale FK can't be submitted. Skips the initial mount
  // (ref starts undefined) so a loaded record keeps its selection.
  const prevBusinessId = React.useRef<string | undefined>(undefined)
  React.useEffect(() => {
    if (
      prevBusinessId.current !== undefined &&
      prevBusinessId.current !== selectedBusinessId
    ) {
      form.setValue("soloarId", "", { shouldValidate: false })
    }
    prevBusinessId.current = selectedBusinessId
  }, [selectedBusinessId, form])

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid max-w-xl gap-5">
      <RHFSelect<SoloarFormValues>
        name="businessId"
        label="Business"
        required
        options={businessOptions}
        placeholder="Select a business"
        triggerClassName="w-full sm:w-80"
      />
      <RHFAutocomplete<SoloarFormValues>
        name="soloarId"
        label="Soloar"
        required
        options={filteredSoloarOptions}
        disabled={!selectedBusinessId}
        placeholder={
          selectedBusinessId
            ? "Select a solar asset"
            : "Select a business first"
        }
        searchPlaceholder="Search solar assets..."
        triggerClassName="w-full sm:w-80"
      />
      <RHFDatePicker<SoloarFormValues>
        name="date"
        label="Date"
        required
        placeholder="Select date"
        triggerClassName="w-full sm:w-60"
      />
      <RHFNumberInput<SoloarFormValues>
        name="meterReading"
        label="Meter Reading"
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
          onClick={() => router.push(SOLOAR_LIST_PATH)}
        >
          Cancel
        </Button>
      </div>
    </RHFForm>
  )
}
