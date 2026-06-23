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
  createAttendance,
  DuplicateAttendanceError,
  updateAttendance,
} from "@/lib/attendance-service"
import {
  attendanceFormDefaults,
  attendanceSchema,
  emptyAttendanceLine,
  lineStatusOptions,
  shiftOptions,
  toAttendanceInput,
  type AttendanceEmployeeOption,
  type AttendanceFormValues,
} from "./attendance-schema"
import { ATTENDANCE_LIST_PATH, ATTENDANCE_NEW_PATH } from "./constants"
import { Trash2 } from "lucide-react"

/** Fresh empty form values (new line array each call) for create mode. */
const freshDefaults = (): AttendanceFormValues => ({
  ...attendanceFormDefaults,
  lines: [{ ...emptyAttendanceLine }],
})

interface AttendanceFormProps {
  mode: "create" | "edit"
  attendanceId?: number
  defaultValues: AttendanceFormValues
  /** Business options for the header FK select (fetched server-side). */
  businessOptions: Option[]
  /** All employees (tagged with their business) for the line autocompletes. */
  employees: AttendanceEmployeeOption[]
}

/** A disabled-looking, read-only value box used for fixed fields in edit mode. */
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
 * Shared create/edit form for an Attendance header plus its lines. The header
 * is a handful of RHF fields; the lines are an editable table driven by
 * `useFieldArray`. Business and Date are locked in edit mode, and the line
 * employee list is scoped to the selected business. On success it returns to
 * the list and refreshes it.
 */
export function AttendanceForm({
  mode,
  attendanceId,
  defaultValues,
  businessOptions,
  employees,
}: AttendanceFormProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    mode: "onBlur",
    defaultValues,
  })

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "lines",
  })

  // Active employees of the selected business — used for the line autocompletes
  // and to auto-populate the roster when a business is chosen.
  const businessId = useWatch({ control: form.control, name: "businessId" })
  const businessEmployees = React.useMemo(
    () =>
      employees.filter(
        (e) => String(e.businessId) === businessId && e.status === 1,
      ),
    [employees, businessId],
  )
  const employeeOptions = React.useMemo<Option[]>(
    () => businessEmployees.map((e) => ({ label: e.label, value: e.value })),
    [businessEmployees],
  )

  // In create mode, selecting a business loads one line per active employee of
  // that business. Business is locked while editing, so this never runs there.
  const prevBusinessRef = React.useRef(defaultValues.businessId)
  React.useEffect(() => {
    if (isEdit) return
    if (prevBusinessRef.current === businessId) return
    prevBusinessRef.current = businessId
    if (businessId && businessEmployees.length > 0) {
      replace(
        businessEmployees.map((e) => ({
          ...emptyAttendanceLine,
          employeeId: e.value,
        })),
      )
    } else {
      replace([{ ...emptyAttendanceLine }])
    }
  }, [isEdit, businessId, businessEmployees, replace])

  const onSubmit = React.useCallback(
    async (values: AttendanceFormValues) => {
      // Requirement 6: client-side guard against duplicate employee + shift
      // lines within this header (the DB unique index is the backstop).
      const seen = new Map<string, number>()
      let duplicate = false
      values.lines.forEach((line, index) => {
        if (!line.employeeId) return
        const key = `${line.employeeId}::${line.shift}`
        if (seen.has(key)) {
          duplicate = true
          form.setError(`lines.${index}.employeeId`, {
            type: "manual",
            message: "This employee already has this shift on this attendance",
          })
        } else {
          seen.set(key, index)
        }
      })
      if (duplicate) return

      // Business + Date are locked in edit mode; source them from the original
      // record so a stripped/disabled value can never reach the payload.
      const effective = isEdit
        ? {
            ...values,
            businessId: defaultValues.businessId,
            date: defaultValues.date,
          }
        : values
      const input = toAttendanceInput(effective)

      try {
        if (isEdit && attendanceId != null) {
          await updateAttendance(attendanceId, input)
          // Update mode: switch to an empty New form after a successful save.
          router.push(ATTENDANCE_NEW_PATH)
          router.refresh()
        } else {
          await createAttendance(input)
          // Create mode: clear the form and stay on the New page (no redirect).
          form.reset(freshDefaults())
          router.refresh()
        }
      } catch (error) {
        if (error instanceof DuplicateAttendanceError) {
          if (/employee|shift/i.test(error.message)) {
            form.setError("root", { type: "manual", message: error.message })
          } else {
            form.setError("date", { type: "manual", message: error.message })
          }
          return
        }
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [isEdit, attendanceId, defaultValues, router, form],
  )

  // Clear: in create mode reset to an empty form (stay); in edit mode switch
  // the page to New mode (empty create form).
  const handleClear = React.useCallback(() => {
    if (isEdit) {
      router.push(ATTENDANCE_NEW_PATH)
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

  const businessDisplay =
    businessOptions.find((o) => o.value === defaultValues.businessId)?.label ??
    defaultValues.businessId
  const dateDisplay = defaultValues.date
    ? format(defaultValues.date, "yyyy-MM-dd")
    : "—"

  const rootError = form.formState.errors.root?.message
  const linesError = form.formState.errors.lines?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid gap-7">
      <div className="grid max-w-3xl gap-5 sm:grid-cols-3">
        {isEdit ? (
          <ReadOnlyField label="Business" value={businessDisplay} />
        ) : (
          <RHFSelect<AttendanceFormValues>
            name="businessId"
            label="Business"
            required
            options={businessOptions}
            placeholder="Select a business"
            triggerClassName="w-full"
          />
        )}
        {isEdit ? (
          <ReadOnlyField label="Date" value={dateDisplay} />
        ) : (
          <RHFDatePicker<AttendanceFormValues>
            name="date"
            label="Date"
            required
            placeholder="Select date"
            triggerClassName="w-full"
          />
        )}
        <RHFInput<AttendanceFormValues>
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
            onClick={() => append({ ...emptyAttendanceLine })}
          >
            Add line
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-muted-foreground dark:border-gray-800">
                <th className="px-3 py-2 font-medium">Employee</th>
                <th className="w-40 px-3 py-2 font-medium">Shift</th>
                <th className="w-28 px-3 py-2 font-medium">Hours</th>
                <th className="w-40 px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Remark</th>
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
                    <RHFAutocomplete<AttendanceFormValues>
                      name={`lines.${index}.employeeId`}
                      options={employeeOptions}
                      placeholder={
                        businessId ? "Select employee" : "Select a business first"
                      }
                      searchPlaceholder="Search employees..."
                      triggerClassName="w-full"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <RHFSelect<AttendanceFormValues>
                      name={`lines.${index}.shift`}
                      options={shiftOptions}
                      triggerClassName="w-full"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <RHFNumberInput<AttendanceFormValues>
                      name={`lines.${index}.hours`}
                      allowNegative={false}
                      decimalScale={2}
                      placeholder="0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <RHFSelect<AttendanceFormValues>
                      name={`lines.${index}.status`}
                      options={lineStatusOptions}
                      triggerClassName="w-full"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <RHFInput<AttendanceFormValues>
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
          onClick={() => router.push(ATTENDANCE_LIST_PATH)}
        >
          List
        </Button>
      </div>
    </RHFForm>
  )
}
