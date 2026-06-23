"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  RHFAutocomplete,
  RHFDatePicker,
  RHFForm,
  RHFInput,
  RHFNumberInput,
  type Option,
} from "@/components/hook-form"
import { getBusiness } from "@/lib/business-service"
import {
  createCoconutHarvest,
  DuplicateCoconutHarvestError,
  updateCoconutHarvest,
} from "@/lib/coconut-harvest-service"
import {
  coconutHarvestFormDefaults,
  coconutHarvestSchema,
  toCoconutHarvestInput,
  type CoconutHarvestFormValues,
} from "./coconut-harvest-schema"
import {
  COCONUT_HARVEST_LIST_PATH,
  COCONUT_HARVEST_NEW_PATH,
} from "./constants"

/** Fresh empty form values (new date / line array each call) for create mode. */
const freshDefaults = (): CoconutHarvestFormValues => ({
  ...coconutHarvestFormDefaults,
  date: new Date(),
  lines: [],
})

interface CoconutHarvestFormProps {
  mode: "create" | "edit"
  coconutHarvestId?: number
  defaultValues: CoconutHarvestFormValues
  /** Estate options (businesses of type Estate) for the header FK select. */
  estateOptions: Option[]
}

/** A disabled-looking, read-only value box for fields locked in edit mode. */
function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex h-10 items-center rounded-lg border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
        {value || "—"}
      </div>
    </div>
  )
}

/**
 * Shared create/edit form for a Coconut Harvest. Selecting an estate loads that
 * estate's divisions as line rows (one per division); estate and date are locked
 * in edit mode. On success it returns to the list and refreshes it.
 */
export function CoconutHarvestForm({
  mode,
  coconutHarvestId,
  defaultValues,
  estateOptions,
}: CoconutHarvestFormProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const form = useForm<CoconutHarvestFormValues>({
    resolver: zodResolver(coconutHarvestSchema),
    mode: "onBlur",
    defaultValues,
  })

  const { fields, remove, replace } = useFieldArray({
    control: form.control,
    name: "lines",
  })

  // Rule: selecting an estate loads all its divisions into the line table.
  // Locked in edit mode (estate cannot change), so this only runs while creating.
  const estateId = useWatch({ control: form.control, name: "estateId" })
  const prevEstateRef = React.useRef(defaultValues.estateId)
  React.useEffect(() => {
    if (isEdit) return
    if (prevEstateRef.current === estateId) return
    prevEstateRef.current = estateId
    if (!estateId) {
      replace([])
      return
    }
    let cancelled = false
    getBusiness(Number(estateId))
      .then((estate) => {
        if (cancelled) return
        const divisions = estate?.estateDivisions ?? []
        replace(
          divisions.map((d) => ({
            divisionId: String(d.id),
            divisionName: d.name,
            quantity: 0,
          })),
        )
      })
      .catch(() => {
        if (!cancelled) replace([])
      })
    return () => {
      cancelled = true
    }
  }, [isEdit, estateId, replace])

  const watchedLines = useWatch({ control: form.control, name: "lines" })
  const totalQuantity = (watchedLines ?? []).reduce(
    (sum, line) => sum + (Number(line?.quantity) || 0),
    0,
  )

  const onSubmit = React.useCallback(
    async (values: CoconutHarvestFormValues) => {
      // Estate + Date are locked in edit mode; source them from the original.
      const effective = isEdit
        ? { ...values, estateId: defaultValues.estateId, date: defaultValues.date }
        : values
      const input = toCoconutHarvestInput(effective)
      try {
        if (isEdit && coconutHarvestId != null) {
          await updateCoconutHarvest(coconutHarvestId, input)
          // Update mode: switch to an empty New form after a successful save.
          router.push(COCONUT_HARVEST_NEW_PATH)
          router.refresh()
        } else {
          await createCoconutHarvest(input)
          // Create mode: clear the form and stay on the New page (no redirect).
          form.reset(freshDefaults())
          router.refresh()
        }
      } catch (error) {
        if (error instanceof DuplicateCoconutHarvestError) {
          form.setError(isEdit ? "root" : "date", {
            type: "manual",
            message: error.message,
          })
          return
        }
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [isEdit, coconutHarvestId, defaultValues, router, form],
  )

  // Clear: in create mode reset to an empty form (stay); in edit mode switch
  // the page to New mode (empty create form).
  const handleClear = React.useCallback(() => {
    if (isEdit) {
      router.push(COCONUT_HARVEST_NEW_PATH)
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

  const estateDisplay =
    estateOptions.find((o) => o.value === defaultValues.estateId)?.label ??
    defaultValues.estateId
  const dateDisplay = defaultValues.date
    ? format(defaultValues.date, "yyyy-MM-dd")
    : "—"

  const rootError = form.formState.errors.root?.message
  const linesError = form.formState.errors.lines?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid gap-7">
      <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
        {isEdit ? (
          <ReadOnlyField label="Estate" value={estateDisplay} />
        ) : (
          <RHFAutocomplete<CoconutHarvestFormValues>
            name="estateId"
            label="Estate"
            required
            options={estateOptions}
            placeholder="Select an estate"
            searchPlaceholder="Search estates..."
            triggerClassName="w-full"
          />
        )}
        {isEdit ? (
          <ReadOnlyField label="Date" value={dateDisplay} />
        ) : (
          <RHFDatePicker<CoconutHarvestFormValues>
            name="date"
            label="Date"
            required
            placeholder="Select date"
            triggerClassName="w-full"
          />
        )}
        <RHFInput<CoconutHarvestFormValues>
          name="remark"
          label="Remark"
          placeholder="Optional"
          maxLength={100}
          className="sm:col-span-2"
        />
      </div>

      <div className="grid gap-3">
        <h3 className="text-sm font-medium text-foreground">Divisions</h3>

        {fields.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-muted-foreground dark:border-gray-800">
            Select an estate to load its divisions.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-muted-foreground dark:border-gray-800">
                  <th className="px-3 py-2 font-medium">Division</th>
                  <th className="w-40 px-3 py-2 font-medium">Quantity</th>
                  <th className="w-24 px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr
                    key={field.id}
                    className="border-b border-gray-100 align-top last:border-0 dark:border-gray-800/60"
                  >
                    <td className="px-3 py-3 font-medium text-foreground">
                      {form.getValues(`lines.${index}.divisionName`)}
                    </td>
                    <td className="px-3 py-2">
                      <RHFNumberInput<CoconutHarvestFormValues>
                        name={`lines.${index}.quantity`}
                        allowNegative={false}
                        decimalScale={0}
                        placeholder="0"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 dark:border-gray-800">
                  <td className="px-3 py-2 text-right font-medium">Total</td>
                  <td className="px-3 py-2 font-semibold text-foreground">
                    {totalQuantity}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}

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
          onClick={() => router.push(COCONUT_HARVEST_LIST_PATH)}
        >
          List
        </Button>
      </div>
    </RHFForm>
  )
}
