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
  RHFSelect,
  type Option,
} from "@/components/hook-form"
import {
  createLatexHarvest,
  DuplicateLatexHarvestError,
  updateLatexHarvest,
} from "@/lib/latex-harvest-service"
import {
  emptyLatexLine,
  latexHarvestFormDefaults,
  latexHarvestSchema,
  statusOptions,
  toLatexHarvestInput,
  type LatexHarvestFormValues,
} from "./latex-harvest-schema"
import { LATEX_HARVEST_LIST_PATH, LATEX_HARVEST_NEW_PATH } from "./constants"
import { Trash2 } from "lucide-react"

/** Fresh empty form values (new date / line array each call) for create mode. */
const freshDefaults = (): LatexHarvestFormValues => ({
  ...latexHarvestFormDefaults,
  date: new Date(),
  lines: [{ ...emptyLatexLine }],
})

interface LatexHarvestFormProps {
  mode: "create" | "edit"
  latexHarvestId?: number
  defaultValues: LatexHarvestFormValues
  /** Estate options (businesses of type Estate) for the header FK select. */
  estateOptions: Option[]
  /** Employee options for each line's FK autocomplete. */
  employeeOptions: Option[]
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
 * Shared create/edit form for a Latex Harvest header plus its per-employee
 * lines. Estate and date are locked in edit mode. On success it returns to the
 * list and refreshes it.
 */
export function LatexHarvestForm({
  mode,
  latexHarvestId,
  defaultValues,
  estateOptions,
  employeeOptions,
}: LatexHarvestFormProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const form = useForm<LatexHarvestFormValues>({
    resolver: zodResolver(latexHarvestSchema),
    mode: "onBlur",
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  })

  const watchedLines = useWatch({ control: form.control, name: "lines" })
  const totals = (watchedLines ?? []).reduce(
    (acc, line) => ({
      liter: acc.liter + (Number(line?.liter) || 0),
      ottapalu: acc.ottapalu + (Number(line?.ottapalu) || 0),
    }),
    { liter: 0, ottapalu: 0 },
  )

  const onSubmit = React.useCallback(
    async (values: LatexHarvestFormValues) => {
      // Estate + Date are locked in edit mode; source them from the original.
      const effective = isEdit
        ? { ...values, estateId: defaultValues.estateId, date: defaultValues.date }
        : values
      const input = toLatexHarvestInput(effective)
      try {
        if (isEdit && latexHarvestId != null) {
          await updateLatexHarvest(latexHarvestId, input)
          // Update mode: switch to an empty New form after a successful save.
          router.push(LATEX_HARVEST_NEW_PATH)
          router.refresh()
        } else {
          await createLatexHarvest(input)
          // Create mode: clear the form and stay on the New page (no redirect).
          form.reset(freshDefaults())
          router.refresh()
        }
      } catch (error) {
        if (error instanceof DuplicateLatexHarvestError) {
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
    [isEdit, latexHarvestId, defaultValues, router, form],
  )

  // Clear: in create mode reset to an empty form (stay); in edit mode switch
  // the page to New mode (empty create form).
  const handleClear = React.useCallback(() => {
    if (isEdit) {
      router.push(LATEX_HARVEST_NEW_PATH)
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
          <RHFAutocomplete<LatexHarvestFormValues>
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
          <RHFDatePicker<LatexHarvestFormValues>
            name="date"
            label="Date"
            required
            placeholder="Select date"
            triggerClassName="w-full"
          />
        )}
        <RHFNumberInput<LatexHarvestFormValues>
          name="rainfall"
          label="Rainfall"
          allowNegative={false}
          decimalScale={2}
          placeholder="0.00"
        />
        <RHFInput<LatexHarvestFormValues>
          name="remark"
          label="Remark"
          placeholder="Optional"
          maxLength={100}
        />
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Lines</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ ...emptyLatexLine })}
          >
            Add line
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-muted-foreground dark:border-gray-800">
                <th className="px-3 py-2 font-medium">Employee</th>
                <th className="w-28 px-3 py-2 font-medium">Liter</th>
                <th className="w-28 px-3 py-2 font-medium">Ottapalu</th>
                <th className="w-44 px-3 py-2 font-medium">Status</th>
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
                    <RHFAutocomplete<LatexHarvestFormValues>
                      name={`lines.${index}.employeeId`}
                      options={employeeOptions}
                      placeholder="Select employee"
                      searchPlaceholder="Search employees..."
                      triggerClassName="w-full"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <RHFNumberInput<LatexHarvestFormValues>
                      name={`lines.${index}.liter`}
                      allowNegative={false}
                      decimalScale={2}
                      placeholder="0.00"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <RHFNumberInput<LatexHarvestFormValues>
                      name={`lines.${index}.ottapalu`}
                      allowNegative={false}
                      decimalScale={2}
                      placeholder="0.00"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <RHFSelect<LatexHarvestFormValues>
                      name={`lines.${index}.status`}
                      options={statusOptions}
                      triggerClassName="w-full"
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
            <tfoot>
              <tr className="border-t border-gray-200 dark:border-gray-800">
                <td className="px-3 py-2 text-right font-medium">Total</td>
                <td className="px-3 py-2 font-semibold text-foreground">
                  {totals.liter.toFixed(2)}
                </td>
                <td className="px-3 py-2 font-semibold text-foreground">
                  {totals.ottapalu.toFixed(2)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
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
          onClick={() => router.push(LATEX_HARVEST_LIST_PATH)}
        >
          List
        </Button>
      </div>
    </RHFForm>
  )
}
