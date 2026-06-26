"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  RHFAutocomplete,
  RHFCurrencyInput,
  RHFDatePicker,
  RHFForm,
  RHFNumberInput,
  RHFSelect,
  type Option,
} from "@/components/hook-form"
import {
  createEmployeeLoan,
  updateEmployeeLoan,
} from "@/lib/employee-loan-service"
import {
  employeeLoanFormDefaults,
  employeeLoanSchema,
  formatMoney,
  statusOptions,
  toEmployeeLoanInput,
  type EmployeeLoanFormValues,
} from "./employee-loan-schema"
import { EMPLOYEE_LOAN_LIST_PATH, EMPLOYEE_LOAN_NEW_PATH } from "./constants"

/** Fresh empty form values for create mode. */
const freshDefaults = (): EmployeeLoanFormValues => ({
  ...employeeLoanFormDefaults,
})

interface EmployeeLoanFormProps {
  mode: "create" | "edit"
  employeeLoanId?: number
  defaultValues: EmployeeLoanFormValues
  /** Employee options for the FK autocomplete (fetched server-side). */
  employeeOptions: Option[]
}

/** A disabled-looking, read-only value box. */
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
 * Shared create/edit form for an Employee Loan. Balance is disabled (system-
 * managed): it mirrors the loan value on create and stays unchanged on edit. On
 * success it returns to the list and refreshes it.
 */
export function EmployeeLoanForm({
  mode,
  employeeLoanId,
  defaultValues,
  employeeOptions,
}: EmployeeLoanFormProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const form = useForm<EmployeeLoanFormValues>({
    resolver: zodResolver(employeeLoanSchema),
    mode: "onBlur",
    defaultValues,
  })

  // Balance is disabled and system-managed: on create it mirrors the loan
  // value; on edit it shows the stored balance.
  const valueAmount = useWatch({ control: form.control, name: "value" })
  const balanceDisplay = isEdit ? defaultValues.balance : valueAmount || 0

  const onSubmit = React.useCallback(
    async (values: EmployeeLoanFormValues) => {
      const input = toEmployeeLoanInput(values)
      // Initial balance equals the loan value on create; unchanged on edit.
      if (!isEdit) input.balance = input.value
      try {
        if (isEdit && employeeLoanId != null) {
          await updateEmployeeLoan(employeeLoanId, input)
          toast.success("Loan updated.")
          // Update mode: switch to an empty New form after a successful save.
          router.push(EMPLOYEE_LOAN_NEW_PATH)
          router.refresh()
        } else {
          await createEmployeeLoan(input)
          toast.success("Loan created.")
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
    [isEdit, employeeLoanId, router, form],
  )

  // Clear: in create mode reset to an empty form (stay); in edit mode switch
  // the page to New mode (empty create form).
  const handleClear = React.useCallback(() => {
    if (isEdit) {
      router.push(EMPLOYEE_LOAN_NEW_PATH)
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
    <RHFForm form={form} onSubmit={onSubmit} className="grid max-w-xl gap-5">
      <RHFAutocomplete<EmployeeLoanFormValues>
        name="employeeId"
        label="Employee"
        required
        options={employeeOptions}
        placeholder="Select an employee"
        searchPlaceholder="Search employees..."
        triggerClassName="w-full sm:w-80"
      />
      <RHFDatePicker<EmployeeLoanFormValues>
        name="issueDate"
        label="Issue Date"
        placeholder="Select issue date"
        triggerClassName="w-full sm:w-60"
      />
      <RHFCurrencyInput<EmployeeLoanFormValues>
        name="value"
        label="Loan Amount"
        required
        placeholder="0.00"
      />
      <RHFCurrencyInput<EmployeeLoanFormValues>
        name="installment"
        label="Installment Amount"
        required
        placeholder="0.00"
      />
      <RHFNumberInput<EmployeeLoanFormValues>
        name="dueDay"
        label="Installment Due Day of Month"
        required
        allowNegative={false}
        decimalScale={0}
        placeholder="1"
      />
      <ReadOnlyField label="Balance" value={formatMoney(balanceDisplay)} />
      <RHFSelect<EmployeeLoanFormValues>
        name="status"
        label="Status"
        required
        options={statusOptions}
        triggerClassName="w-full sm:w-60"
      />

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
          onClick={() => router.push(EMPLOYEE_LOAN_LIST_PATH)}
        >
          List
        </Button>
      </div>
    </RHFForm>
  )
}
