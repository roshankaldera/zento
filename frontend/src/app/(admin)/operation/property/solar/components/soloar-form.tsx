"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  RHFAutocomplete,
  RHFDatePicker,
  RHFForm,
  RHFNumberInput,
  type Option,
} from "@/components/hook-form"
import { createSoloar, updateSoloar } from "@/lib/soloar-service"
import {
  soloarSchema,
  toSoloarInput,
  type SoloarFormValues,
} from "./soloar-schema"
import { SOLOAR_LIST_PATH } from "./constants"

interface SoloarFormProps {
  mode: "create" | "edit"
  soloarId?: number
  defaultValues: SoloarFormValues
  /** Solar asset options for the FK autocomplete (fetched server-side). */
  soloarOptions: Option[]
}

/**
 * Shared create/edit form for a Soloar meter reading. On success it returns to
 * the list and refreshes it.
 */
export function SoloarForm({
  mode,
  soloarId,
  defaultValues,
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
        } else {
          await createSoloar(input)
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

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid max-w-xl gap-5">
      <RHFAutocomplete<SoloarFormValues>
        name="soloarId"
        label="Soloar"
        required
        options={soloarOptions}
        placeholder="Select a solar asset"
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
