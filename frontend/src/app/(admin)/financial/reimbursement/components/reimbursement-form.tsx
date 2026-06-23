"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
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
  type Option,
} from "@/components/hook-form"
import {
  createReimbursement,
  DuplicateReimbursementError,
  updateReimbursement,
} from "@/lib/reimbursement-service"
import {
  emptyLine,
  formatMoney,
  linesTotal,
  reimbursementFormDefaults,
  reimbursementSchema,
  statusOptions,
  toReimbursementInput,
  type ReimbursementFormValues,
} from "./reimbursement-schema"
import { REIMBURSEMENT_LIST_PATH, REIMBURSEMENT_NEW_PATH } from "./constants"
import { Trash2 } from "lucide-react"

/** Fresh empty form values (new date / line array each call) for create mode. */
const freshDefaults = (): ReimbursementFormValues => ({
  ...reimbursementFormDefaults,
  date: new Date(),
  lines: [{ ...emptyLine }],
})

interface ReimbursementFormProps {
  mode: "create" | "edit"
  reimbursementId?: number
  defaultValues: ReimbursementFormValues
  /** Business options for the header FK autocomplete. */
  businessOptions: Option[]
}

/** A disabled, read-only display box for a derived/locked value. */
function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex h-10 items-center rounded-lg border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
        {value}
      </div>
    </div>
  )
}

/**
 * Shared create/edit form for a Reimbursement header plus its lines. `post_by`
 * and `total_value` are disabled (server-managed); on create the server forces
 * the status to Finish, so the status field only shows when editing. On success
 * it returns to the list and refreshes it.
 */
export function ReimbursementForm({
  mode,
  reimbursementId,
  defaultValues,
  businessOptions,
}: ReimbursementFormProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const form = useForm<ReimbursementFormValues>({
    resolver: zodResolver(reimbursementSchema),
    mode: "onBlur",
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  })

  const watchedLines = useWatch({ control: form.control, name: "lines" })
  const grandTotal = linesTotal(watchedLines)

  const onSubmit = React.useCallback(
    async (values: ReimbursementFormValues) => {
      const input = toReimbursementInput(values)
      try {
        if (isEdit && reimbursementId != null) {
          await updateReimbursement(reimbursementId, input)
          // Update mode: switch to an empty New form after a successful save.
          router.push(REIMBURSEMENT_NEW_PATH)
          router.refresh()
        } else {
          await createReimbursement(input)
          // Create mode: clear the form and stay on the New page (no redirect).
          form.reset(freshDefaults())
          router.refresh()
        }
      } catch (error) {
        if (error instanceof DuplicateReimbursementError) {
          form.setError("root", {
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
    [isEdit, reimbursementId, router, form],
  )

  // Clear: in create mode reset to an empty form (stay); in edit mode switch
  // the page to New mode (empty create form).
  const handleClear = React.useCallback(() => {
    if (isEdit) {
      router.push(REIMBURSEMENT_NEW_PATH)
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
        <RHFAutocomplete<ReimbursementFormValues>
          name="businessId"
          label="Business"
          required
          options={businessOptions}
          placeholder="Select a business"
          searchPlaceholder="Search businesses..."
          triggerClassName="w-full"
        />
        <RHFInput<ReimbursementFormValues>
          name="reimbursementNo"
          label="Reimbursement No"
          disabled
          placeholder="Auto-generated on save"
          maxLength={20}
        />
        <RHFDatePicker<ReimbursementFormValues>
          name="date"
          label="Date"
          required
          placeholder="Select date"
          triggerClassName="w-full"
        />
        <RHFInput<ReimbursementFormValues>
          name="remark"
          label="Remark"
          placeholder="Optional"
          maxLength={100}
        />
        {/* Disabled per business rule — stamped at save time. */}
        <RHFNumberInput<ReimbursementFormValues>
          name="postBy"
          label="Posted By"
          //disabled
          allowNegative={false}
          decimalScale={0}
          thousandSeparator=""
        />
        {/* Disabled per business rule — computed from the lines. */}
        <ReadOnlyField label="Total Value" value={formatMoney(grandTotal)} />
        {isEdit && (
          <RHFSelect<ReimbursementFormValues>
            name="status"
            label="Status"
            required
            options={statusOptions}
            triggerClassName="w-full"
          />
        )}
      </div>

      <hr></hr>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground">Reimbursement Lines</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ ...emptyLine })}
          >
            Add line
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-muted-foreground dark:border-gray-800">
                <th className="w-44 px-3 py-2 font-medium">Bill Date</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="px-3 py-2 font-medium">Reference</th>
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
                  <td className="px-3 py-2">
                    <RHFDatePicker<ReimbursementFormValues>
                      name={`lines.${index}.billDate`}
                      placeholder="Select date"
                      triggerClassName="w-full"
                    />
                  </td>
                  <td className="min-w-[180px] px-3 py-2">
                    <RHFInput<ReimbursementFormValues>
                      name={`lines.${index}.description`}
                      placeholder="Optional"
                      maxLength={100}
                    />
                  </td>
                  <td className="min-w-[160px] px-3 py-2">
                    <RHFInput<ReimbursementFormValues>
                      name={`lines.${index}.reference`}
                      placeholder="Optional"
                      maxLength={100}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <RHFCurrencyInput<ReimbursementFormValues>
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
                <td className="px-3 py-2 text-right font-medium" colSpan={3}>
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
          onClick={() => router.push(REIMBURSEMENT_LIST_PATH)}
        >
          List
        </Button>
      </div>
    </RHFForm>
  )
}
