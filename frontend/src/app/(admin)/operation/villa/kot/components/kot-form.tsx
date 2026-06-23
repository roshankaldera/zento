"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  RHFAutocomplete,
  RHFDatePicker,
  RHFForm,
  RHFInput,
  RHFNumberInput,
  RHFTextarea,
  type Option,
} from "@/components/hook-form"
import { createKot, updateKot } from "@/lib/kot-service"
import {
  emptyKotLine,
  kotFormDefaults,
  kotSchema,
  toKotInput,
  type KotFormValues,
} from "./kot-schema"
import { KOT_LIST_PATH, KOT_NEW_PATH } from "./constants"
import { Trash2 } from "lucide-react"

/** Fresh empty form values (new line array each call) for create mode. */
const freshDefaults = (): KotFormValues => ({
  ...kotFormDefaults,
  lines: [{ ...emptyKotLine }],
})

interface KotFormProps {
  mode: "create" | "edit"
  kotId?: number
  defaultValues: KotFormValues
  /** Business options for the header FK select (fetched server-side). */
  businessOptions: Option[]
  /** Booking options for the header FK select (fetched server-side). */
  bookingOptions: Option[]
}

/**
 * Shared create/edit form for a KOT header plus its lines. The header is a few
 * RHF fields; the lines are an editable table driven by `useFieldArray`. On
 * success it returns to the list and refreshes it.
 */
export function KotForm({
  mode,
  kotId,
  defaultValues,
  businessOptions,
  bookingOptions,
}: KotFormProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const form = useForm<KotFormValues>({
    resolver: zodResolver(kotSchema),
    mode: "onBlur",
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  })

  const onSubmit = React.useCallback(
    async (values: KotFormValues) => {
      const input = toKotInput(values)
      try {
        if (isEdit && kotId != null) {
          await updateKot(kotId, input)
          // Update mode: switch to an empty New form after a successful save.
          router.push(KOT_NEW_PATH)
          router.refresh()
        } else {
          await createKot(input)
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
    [isEdit, kotId, router, form],
  )

  // Clear: in create mode reset to an empty form (stay); in edit mode switch
  // the page to New mode (empty create form).
  const handleClear = React.useCallback(() => {
    if (isEdit) {
      router.push(KOT_NEW_PATH)
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
  const linesError = form.formState.errors.lines?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid gap-7">
      <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
        <RHFAutocomplete<KotFormValues>
          name="businessId"
          label="Business"
          required
          options={businessOptions}
          placeholder="Select a business"
          searchPlaceholder="Search businesses..."
          triggerClassName="w-full"
        />
        <RHFAutocomplete<KotFormValues>
          name="bookingId"
          label="Booking"
          required
          options={bookingOptions}
          placeholder="Select a booking"
          searchPlaceholder="Search bookings..."
          triggerClassName="w-full"
        />
        <RHFDatePicker<KotFormValues>
          name="requestTime"
          label="Request Time"
          required
          placeholder="Select date"
          triggerClassName="w-full"
        />
        <RHFTextarea<KotFormValues>
          name="remark"
          label="Description"
          placeholder="Optional"
          maxLength={500}
          className="sm:col-span-2"
        />
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Lines</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ ...emptyKotLine })}
          >
            Add line
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-muted-foreground dark:border-gray-800">
                <th className="px-3 py-2 font-medium">Item</th>
                <th className="w-32 px-3 py-2 font-medium">Quantity</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="w-24 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr
                  key={field.id}
                  className="border-b border-gray-100 align-top last:border-0 dark:border-gray-800/60"
                >
                  <td className="px-3 py-2">
                    <RHFInput<KotFormValues>
                      name={`lines.${index}.item`}
                      placeholder="Item name"
                      maxLength={100}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <RHFNumberInput<KotFormValues>
                      name={`lines.${index}.quantity`}
                      allowNegative={false}
                      decimalScale={2}
                      placeholder="0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <RHFInput<KotFormValues>
                      name={`lines.${index}.remark`}
                      placeholder="Optional"
                      maxLength={100}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {linesError && (
          <p className="text-sm text-destructive" role="alert">
            {linesError}
          </p>
        )}
      </div>

      {rootError && (
        <p className="text-sm text-destructive" role="alert">
          {rootError}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
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
          onClick={() => router.push(KOT_LIST_PATH)}
        >
          List
        </Button>
      </div>
    </RHFForm>
  )
}
