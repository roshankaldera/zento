"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  RHFAutocomplete,
  RHFForm,
  RHFInput,
  RHFNumberInput,
  RHFSelect,
  type Option,
} from "@/components/hook-form"
import {
  createBudget,
  DuplicateBudgetError,
  updateBudget,
} from "@/lib/budget-service"
import {
  budgetSchema,
  emptyLine,
  lineTotal,
  MONTHS,
  toBudgetInput,
  yearOptions,
  type BudgetFormValues,
} from "./budget-schema"
import { BUDGET_LIST_PATH } from "./constants"

/**
 * An option that also carries its owning `businessId`, so the form can filter
 * the list down to the selected business client-side.
 */
export interface BusinessScopedOption extends Option {
  businessId: number
}

interface BudgetFormProps {
  mode: "create" | "edit"
  budgetId?: number
  defaultValues: BudgetFormValues
  /** Business options for the header FK autocomplete. */
  businessOptions: Option[]
  /** Account options for each line's FK autocomplete, scoped by business. */
  accountOptions: BusinessScopedOption[]
}

const fmt = (n: number) =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

/**
 * Shared create/edit form for a Budget header plus its per-account lines (one
 * amount per calendar month). On success it returns to the list and refreshes.
 */
export function BudgetForm({
  mode,
  budgetId,
  defaultValues,
  businessOptions,
  accountOptions,
}: BudgetFormProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    mode: "onBlur",
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  })

  const watchedLines = useWatch({ control: form.control, name: "lines" })

  // The Account list is scoped to the selected business. Filtering is done
  // client-side off the pre-fetched, business-tagged option list.
  const selectedBusinessId = useWatch({
    control: form.control,
    name: "businessId",
  })
  const filteredAccountOptions = React.useMemo(
    () =>
      selectedBusinessId
        ? accountOptions.filter(
            (o) => String(o.businessId) === selectedBusinessId,
          )
        : [],
    [accountOptions, selectedBusinessId],
  )

  // When the business changes, clear the line accounts that belonged to the
  // previous business so a stale FK can't be submitted. Skips the initial mount
  // (ref starts undefined) so a loaded record keeps its selections.
  const prevBusinessId = React.useRef<string | undefined>(undefined)
  React.useEffect(() => {
    if (
      prevBusinessId.current !== undefined &&
      prevBusinessId.current !== selectedBusinessId
    ) {
      form.getValues("lines").forEach((_, index) => {
        form.setValue(`lines.${index}.accountId`, "", {
          shouldValidate: false,
        })
      })
    }
    prevBusinessId.current = selectedBusinessId
  }, [selectedBusinessId, form])

  // Per-month column totals + the overall grand total (display only).
  const columnTotals = MONTHS.map((m) =>
    (watchedLines ?? []).reduce(
      (sum, line) => sum + (Number(line?.[m.key]) || 0),
      0,
    ),
  )
  const grandTotal = (watchedLines ?? []).reduce(
    (sum, line) => sum + lineTotal(line),
    0,
  )

  const onSubmit = React.useCallback(
    async (values: BudgetFormValues) => {
      const input = toBudgetInput(values)
      try {
        if (isEdit && budgetId != null) {
          await updateBudget(budgetId, input)
        } else {
          await createBudget(input)
        }
        router.push(BUDGET_LIST_PATH)
        router.refresh()
      } catch (error) {
        if (error instanceof DuplicateBudgetError) {
          form.setError("year", {
            type: "manual",
            message: "A budget for this business and year already exists",
          })
          return
        }
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [isEdit, budgetId, router, form],
  )

  const rootError = form.formState.errors.root?.message
  const linesError = form.formState.errors.lines?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid gap-7">
      <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
        <RHFAutocomplete<BudgetFormValues>
          name="businessId"
          label="Business"
          required
          options={businessOptions}
          placeholder="Select a business"
          searchPlaceholder="Search businesses..."
          triggerClassName="w-full"
        />
        <RHFSelect<BudgetFormValues>
          name="year"
          label="Year"
          required
          options={yearOptions}
          placeholder="Select a year"
          triggerClassName="w-full"
        />
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Lines</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ ...emptyLine })}
          >
            Add line
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full min-w-[1400px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-muted-foreground dark:border-gray-800">
                <th className="px-3 py-2 font-medium">Account</th>
                <th className="px-3 py-2 font-medium">Description</th>
                {MONTHS.map((m) => (
                  <th key={m.key} className="w-28 px-2 py-2 text-right font-medium">
                    {m.label}
                  </th>
                ))}
                <th className="w-28 px-3 py-2 text-right font-medium">Total</th>
                <th className="w-24 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr
                  key={field.id}
                  className="border-b border-gray-100 align-top last:border-0 dark:border-gray-800/60"
                >
                  <td className="min-w-[180px] px-3 py-2">
                    <RHFAutocomplete<BudgetFormValues>
                      name={`lines.${index}.accountId`}
                      options={filteredAccountOptions}
                      placeholder={
                        selectedBusinessId
                          ? "Select account"
                          : "Select a business first"
                      }
                      searchPlaceholder="Search accounts..."
                      disabled={!selectedBusinessId}
                      triggerClassName="w-full"
                    />
                  </td>
                  <td className="min-w-[180px] px-3 py-2">
                    <RHFInput<BudgetFormValues>
                      name={`lines.${index}.description`}
                      placeholder="Optional"
                      maxLength={100}
                    />
                  </td>
                  {MONTHS.map((m) => (
                    <td key={m.key} className="px-2 py-2">
                      <RHFNumberInput<BudgetFormValues>
                        name={`lines.${index}.${m.key}`}
                        allowNegative={false}
                        decimalScale={2}
                        placeholder="0.00"
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right font-medium text-foreground">
                    {fmt(lineTotal(watchedLines?.[index]))}
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
                <td className="px-3 py-2 text-right font-medium" colSpan={2}>
                  Total
                </td>
                {columnTotals.map((t, i) => (
                  <td
                    key={MONTHS[i].key}
                    className="px-2 py-2 text-right font-semibold text-foreground"
                  >
                    {fmt(t)}
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-semibold text-foreground">
                  {fmt(grandTotal)}
                </td>
                <td />
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
          {submitting ? "Saving…" : isEdit ? "Update" : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => router.push(BUDGET_LIST_PATH)}
        >
          Cancel
        </Button>
      </div>
    </RHFForm>
  )
}
