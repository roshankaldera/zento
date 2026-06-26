"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
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
  RHFSelect,
  type Option,
} from "@/components/hook-form"
import {
  createRecurring,
  DuplicateRecurringError,
  updateRecurring,
} from "@/lib/recurring-service"
import {
  emptyLine,
  formatMoney,
  linesTotal,
  recurringFormDefaults,
  recurringSchema,
  statusOptions,
  toRecurringInput,
  typeOptions,
  type RecurringFormValues,
} from "./recurring-schema"
import { RECURRING_LIST_PATH, RECURRING_NEW_PATH } from "./constants"
import type { BusinessScopedOption } from "./recurring-options"
import { Trash2 } from "lucide-react"

/** Fresh empty form values (new line array each call) for create mode. */
const freshDefaults = (): RecurringFormValues => ({
  ...recurringFormDefaults,
  lines: [{ ...emptyLine }],
})

interface RecurringFormProps {
  mode: "create" | "edit"
  recurringId?: number
  defaultValues: RecurringFormValues
  businessOptions: Option[]
  bankOptions: BusinessScopedOption[]
  categoryOptions: Option[]
  accountOptions: BusinessScopedOption[]
  assetOptions: Option[]
  employeeOptions: Option[]
  supplierOptions: Option[]
}

/**
 * Shared create/edit form for a Recurring header plus its lines. `status` is a
 * normal Active/Inactive Select (defaults to Active). On success it returns to
 * the list and refreshes it.
 */
export function RecurringForm({
  mode,
  recurringId,
  defaultValues,
  businessOptions,
  bankOptions,
  categoryOptions,
  accountOptions,
  assetOptions,
  employeeOptions,
  supplierOptions,
}: RecurringFormProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const form = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringSchema),
    mode: "onBlur",
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  })

  const watchedLines = useWatch({ control: form.control, name: "lines" })
  const grandTotal = linesTotal(watchedLines)

  // Bank and Account lists are scoped to the selected business. Filtering is
  // done client-side off the pre-fetched, business-tagged option lists.
  const selectedBusinessId = useWatch({
    control: form.control,
    name: "businessId",
  })
  const filteredBankOptions = React.useMemo(
    () =>
      selectedBusinessId
        ? bankOptions.filter((o) => String(o.businessId) === selectedBusinessId)
        : [],
    [bankOptions, selectedBusinessId],
  )
  const filteredAccountOptions = React.useMemo(
    () =>
      selectedBusinessId
        ? accountOptions.filter(
            (o) => String(o.businessId) === selectedBusinessId,
          )
        : [],
    [accountOptions, selectedBusinessId],
  )

  // When the business changes, clear the bank + line accounts that belonged to
  // the previous business so a stale FK can't be submitted. Skips the initial
  // mount (ref starts undefined) so a loaded record keeps its selections.
  const prevBusinessId = React.useRef<string | undefined>(undefined)
  React.useEffect(() => {
    if (
      prevBusinessId.current !== undefined &&
      prevBusinessId.current !== selectedBusinessId
    ) {
      form.setValue("bankId", "", { shouldValidate: false })
      form.getValues("lines").forEach((_, index) => {
        form.setValue(`lines.${index}.accountId`, "", {
          shouldValidate: false,
        })
      })
    }
    prevBusinessId.current = selectedBusinessId
  }, [selectedBusinessId, form])

  const onSubmit = React.useCallback(
    async (values: RecurringFormValues) => {
      const input = toRecurringInput(values)
      try {
        if (isEdit && recurringId != null) {
          await updateRecurring(recurringId, input)
          toast.success("Recurring updated.")
          // Update mode: switch to an empty New form after a successful save.
          router.push(RECURRING_NEW_PATH)
          router.refresh()
        } else {
          await createRecurring(input)
          toast.success("Recurring created.")
          // Create mode: clear the form and stay on the New page (no redirect).
          form.reset(freshDefaults())
          router.refresh()
        }
      } catch (error) {
        if (error instanceof DuplicateRecurringError) {
          form.setError("root", { type: "manual", message: error.message })
          return
        }
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [isEdit, recurringId, router, form],
  )

  // Clear: in create mode reset to an empty form (stay); in edit mode switch
  // the page to New mode (empty create form).
  const handleClear = React.useCallback(() => {
    if (isEdit) {
      router.push(RECURRING_NEW_PATH)
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
      <div className="grid max-w-4xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <RHFAutocomplete<RecurringFormValues>
          name="businessId"
          label="Business"
          required
          options={businessOptions}
          placeholder="Select a business"
          searchPlaceholder="Search businesses..."
          triggerClassName="w-full"
        />
        <RHFAutocomplete<RecurringFormValues>
          name="bankId"
          label="Bank"
          required
          options={filteredBankOptions}
          placeholder={
            selectedBusinessId ? "Select a bank" : "Select a business first"
          }
          searchPlaceholder="Search banks..."
          disabled={!selectedBusinessId}
          triggerClassName="w-full"
        />
        <RHFAutocomplete<RecurringFormValues>
          name="category"
          label="Category"
          required
          options={categoryOptions}
          placeholder="Select a category"
          searchPlaceholder="Search categories..."
          triggerClassName="w-full"
        />
        <RHFNumberInput<RecurringFormValues>
          name="recurringDay"
          label="Recurring Day of Month"
          required
          allowNegative={false}
          decimalScale={0}
          thousandSeparator=""
          placeholder="1"
        />
        <RHFDatePicker<RecurringFormValues>
          name="fromPeriod"
          label="From Period"
          placeholder="Select date"
          triggerClassName="w-full"
        />
        <RHFDatePicker<RecurringFormValues>
          name="toPeriod"
          label="To Period"
          placeholder="Select date"
          triggerClassName="w-full"
        />
        <RHFSelect<RecurringFormValues>
          name="status"
          label="Status"
          required
          options={statusOptions}
          triggerClassName="w-full"
        />
        <RHFInput<RecurringFormValues>
          name="remark"
          label="Remark"
          placeholder="Optional"
          maxLength={100}
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      <hr></hr>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground">Recurring Lines</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ ...emptyLine })}
          >
            Add line
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full min-w-[1500px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-muted-foreground dark:border-gray-800">
                <th className="px-3 py-2 font-medium">Account</th>
                <th className="w-32 px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="px-3 py-2 font-medium">Reference</th>
                <th className="px-3 py-2 font-medium">Asset</th>
                <th className="px-3 py-2 font-medium">Employee</th>
                <th className="px-3 py-2 font-medium">Supplier</th>
                <th className="w-36 px-3 py-2 font-medium">Value</th>
                <th className="w-24 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr
                  key={field.id}
                  className="border-b border-gray-100 align-top last:border-0 dark:border-gray-800/60"
                >
                  <td className="min-w-[170px] px-3 py-2">
                    <RHFAutocomplete<RecurringFormValues>
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
                  <td className="px-3 py-2">
                    <RHFSelect<RecurringFormValues>
                      name={`lines.${index}.type`}
                      options={typeOptions}
                      triggerClassName="w-full"
                    />
                  </td>
                  <td className="min-w-[160px] px-3 py-2">
                    <RHFInput<RecurringFormValues>
                      name={`lines.${index}.description`}
                      placeholder="Optional"
                      maxLength={100}
                    />
                  </td>
                  <td className="min-w-[150px] px-3 py-2">
                    <RHFInput<RecurringFormValues>
                      name={`lines.${index}.reference`}
                      placeholder="Optional"
                      maxLength={100}
                    />
                  </td>
                  <td className="min-w-[160px] px-3 py-2">
                    <RHFAutocomplete<RecurringFormValues>
                      name={`lines.${index}.assetId`}
                      options={assetOptions}
                      placeholder="Optional"
                      searchPlaceholder="Search assets..."
                      triggerClassName="w-full"
                    />
                  </td>
                  <td className="min-w-[170px] px-3 py-2">
                    <RHFAutocomplete<RecurringFormValues>
                      name={`lines.${index}.empId`}
                      options={employeeOptions}
                      placeholder="Optional"
                      searchPlaceholder="Search employees..."
                      triggerClassName="w-full"
                    />
                  </td>
                  <td className="min-w-[160px] px-3 py-2">
                    <RHFAutocomplete<RecurringFormValues>
                      name={`lines.${index}.supplierId`}
                      options={supplierOptions}
                      placeholder="Optional"
                      searchPlaceholder="Search suppliers..."
                      triggerClassName="w-full"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <RHFCurrencyInput<RecurringFormValues>
                      name={`lines.${index}.value`}
                      placeholder="0.00"
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
                <td className="px-3 py-2 text-right font-medium" colSpan={7}>
                  Total
                </td>
                <td className="px-3 py-2 font-semibold text-foreground">
                  {formatMoney(grandTotal)}
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

      <hr></hr>

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
          onClick={() => router.push(RECURRING_LIST_PATH)}
        >
          List
        </Button>
      </div>
    </RHFForm>
  )
}
