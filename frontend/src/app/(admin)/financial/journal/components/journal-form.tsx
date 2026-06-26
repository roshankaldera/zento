"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  RHFAutocomplete,
  RHFCurrencyInput,
  RHFDatePicker,
  RHFForm,
  RHFInput,
  RHFSelect,
  type Option,
} from "@/components/hook-form"
import { useAuth } from "@/context/AuthContext"
import {
  createJournal,
  DuplicateJournalError,
  JournalApiError,
  updateJournal,
} from "@/lib/journal-service"
import {
  emptyLine,
  formatMoney,
  journalFormDefaults,
  journalSchema,
  linesTotal,
  statusOptions,
  toJournalInput,
  typeOptions,
  type JournalFormValues,
} from "./journal-schema"
import { JOURNAL_LIST_PATH, JOURNAL_NEW_PATH } from "./constants"
import type { BusinessScopedOption } from "./journal-options"

/** Fresh empty form values (new date / line array each call) for create mode. */
const freshDefaults = (): JournalFormValues => ({
  ...journalFormDefaults,
  date: new Date(),
  lines: [{ ...emptyLine }],
})

interface JournalFormProps {
  mode: "create" | "edit"
  journalId?: number
  defaultValues: JournalFormValues
  businessOptions: Option[]
  bankOptions: BusinessScopedOption[]
  categoryOptions: Option[]
  accountOptions: BusinessScopedOption[]
  assetOptions: Option[]
  employeeOptions: Option[]
  supplierOptions: Option[]
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
 * Shared create/edit form for a Journal header plus its lines. `post_by` and
 * `total_value` are disabled (server-managed); on create the server forces the
 * status to Finish, so the status field only shows when editing. On success it
 * returns to the list and refreshes it.
 */
export function JournalForm({
  mode,
  journalId,
  defaultValues,
  businessOptions,
  bankOptions,
  categoryOptions,
  accountOptions,
  assetOptions,
  employeeOptions,
  supplierOptions,
}: JournalFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const isEdit = mode === "edit"

  const form = useForm<JournalFormValues>({
    resolver: zodResolver(journalSchema),
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
    async (values: JournalFormValues) => {
      if (user == null) {
        form.setError("root", {
          type: "manual",
          message: "Your session has expired. Please sign in again.",
        })
        return
      }
      const input = toJournalInput(values, user.id)
      try {
        if (isEdit && journalId != null) {
          await updateJournal(journalId, input)
          toast.success("Journal updated.")
          // Update mode: switch to an empty New form after a successful save.
          router.push(JOURNAL_NEW_PATH)
          router.refresh()
        } else {
          await createJournal(input)
          toast.success("Journal created.")
          // Create mode: clear the form and stay on the New page (no redirect).
          form.reset(freshDefaults())
          router.refresh()
        }
      } catch (error) {
        if (error instanceof DuplicateJournalError) {
          form.setError("root", { type: "manual", message: error.message })
          return
        }
        // Surface the backend's actual message (e.g. an invalid reference or a
        // validation failure) instead of an opaque catch-all, so the user can
        // tell what to fix. Fall back to a generic message for network errors.
        const message =
          error instanceof JournalApiError
            ? error.message
            : "Something went wrong. Please try again."
        form.setError("root", { type: "manual", message })
      }
    },
    [isEdit, journalId, router, form, user],
  )

  // Clear: in create mode reset to an empty form (stay); in edit mode switch
  // the page to New mode (empty create form).
  const handleClear = React.useCallback(() => {
    if (isEdit) {
      router.push(JOURNAL_NEW_PATH)
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
        <RHFAutocomplete<JournalFormValues>
          name="businessId"
          label="Business"
          required
          options={businessOptions}
          placeholder="Select a business"
          searchPlaceholder="Search businesses..."
          triggerClassName="w-full"
        />
        <RHFAutocomplete<JournalFormValues>
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
        <RHFAutocomplete<JournalFormValues>
          name="category"
          label="Category"
          required
          options={categoryOptions}
          placeholder="Select a category"
          searchPlaceholder="Search categories..."
          triggerClassName="w-full"
        />
        <RHFInput<JournalFormValues>
          name="journalNo"
          label="Journal No"
          disabled
          placeholder="Auto-generated on save"
          maxLength={20}
        />
        <RHFDatePicker<JournalFormValues>
          name="date"
          label="Date"
          required
          placeholder="Select date"
          triggerClassName="w-full"
        />
        <RHFInput<JournalFormValues>
          name="remark"
          label="Remark"
          placeholder="Optional"
          maxLength={100}
        />
        {/* Disabled per business rule — computed from the lines. */}
        <ReadOnlyField label="Total Value" value={formatMoney(grandTotal)} />
        {isEdit && (
          <RHFSelect<JournalFormValues>
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
          <h3 className="text-lg font-large text-foreground">Journal Lines</h3>
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
                    <RHFAutocomplete<JournalFormValues>
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
                    <RHFSelect<JournalFormValues>
                      name={`lines.${index}.type`}
                      options={typeOptions}
                      triggerClassName="w-full"
                    />
                  </td>
                  <td className="min-w-[160px] px-3 py-2">
                    <RHFInput<JournalFormValues>
                      name={`lines.${index}.description`}
                      placeholder="Optional"
                      maxLength={100}
                    />
                  </td>
                  <td className="min-w-[150px] px-3 py-2">
                    <RHFInput<JournalFormValues>
                      name={`lines.${index}.reference`}
                      placeholder="Optional"
                      maxLength={100}
                    />
                  </td>
                  <td className="min-w-[160px] px-3 py-2">
                    <RHFAutocomplete<JournalFormValues>
                      name={`lines.${index}.assetId`}
                      options={assetOptions}
                      placeholder="Optional"
                      searchPlaceholder="Search assets..."
                      triggerClassName="w-full"
                    />
                  </td>
                  <td className="min-w-[170px] px-3 py-2">
                    <RHFAutocomplete<JournalFormValues>
                      name={`lines.${index}.empId`}
                      options={employeeOptions}
                      placeholder="Optional"
                      searchPlaceholder="Search employees..."
                      triggerClassName="w-full"
                    />
                  </td>
                  <td className="min-w-[160px] px-3 py-2">
                    <RHFAutocomplete<JournalFormValues>
                      name={`lines.${index}.supplierId`}
                      options={supplierOptions}
                      placeholder="Optional"
                      searchPlaceholder="Search suppliers..."
                      triggerClassName="w-full"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <RHFCurrencyInput<JournalFormValues>
                      name={`lines.${index}.value`}
                      placeholder="0.00"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
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
          onClick={() => router.push(JOURNAL_LIST_PATH)}
        >
          List
        </Button>
      </div>
    </RHFForm>
  )
}
