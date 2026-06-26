"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  RHFAutocomplete,
  RHFDatePicker,
  RHFForm,
  RHFInput,
  RHFSelect,
  type Option,
} from "@/components/hook-form"
import { createLeave, DuplicateLeaveError, updateLeave } from "@/lib/leave-service"
import {
  leaveFormDefaults,
  leaveSchema,
  periodOptions,
  toLeaveInput,
  type LeaveFormValues,
} from "./leave-schema"
import { LEAVE_LIST_PATH, LEAVE_NEW_PATH } from "./constants"

/** Fresh empty form values for create mode. */
const freshDefaults = (): LeaveFormValues => ({ ...leaveFormDefaults })

interface LeaveFormProps {
  mode: "create" | "edit"
  leaveId?: number
  defaultValues: LeaveFormValues
  /** Employee options for the FK autocomplete (fetched server-side). */
  employeeOptions: Option[]
}

/**
 * Shared create/edit form for a Leave. Built from the reusable RHF field
 * library; on success it returns to the list and refreshes it.
 */
export function LeaveForm({
  mode,
  leaveId,
  defaultValues,
  employeeOptions,
}: LeaveFormProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    mode: "onBlur",
    defaultValues,
  })

  const onSubmit = React.useCallback(
    async (values: LeaveFormValues) => {
      const input = toLeaveInput(values)
      try {
        if (isEdit && leaveId != null) {
          await updateLeave(leaveId, input)
          toast.success("Leave updated.")
          // Update mode: switch to an empty New form after a successful save.
          router.push(LEAVE_NEW_PATH)
          router.refresh()
        } else {
          await createLeave(input)
          toast.success("Leave created.")
          // Create mode: clear the form and stay on the New page (no redirect).
          form.reset(freshDefaults())
          router.refresh()
        }
      } catch (error) {
        if (error instanceof DuplicateLeaveError) {
          form.setError("employeeId", {
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
    [isEdit, leaveId, router, form],
  )

  // Clear: in create mode reset to an empty form (stay); in edit mode switch
  // the page to New mode (empty create form).
  const handleClear = React.useCallback(() => {
    if (isEdit) {
      router.push(LEAVE_NEW_PATH)
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
      <RHFDatePicker<LeaveFormValues>
        name="date"
        label="Date"
        required
        placeholder="Select date"
        triggerClassName="w-full sm:w-60"
      />
      <RHFAutocomplete<LeaveFormValues>
        name="employeeId"
        label="Employee"
        required
        options={employeeOptions}
        placeholder="Select an employee"
        searchPlaceholder="Search employees..."
        triggerClassName="w-full sm:w-80"
      />
      <RHFSelect<LeaveFormValues>
        name="period"
        label="Period"
        required
        options={periodOptions}
        triggerClassName="w-full sm:w-60"
      />
      <RHFInput<LeaveFormValues>
        name="reason"
        label="Reason"
        placeholder="Optional"
        maxLength={100}
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
          onClick={() => router.push(LEAVE_LIST_PATH)}
        >
          List
        </Button>
      </div>
    </RHFForm>
  )
}
