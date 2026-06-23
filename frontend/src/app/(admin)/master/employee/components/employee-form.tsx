"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  RHFDatePicker,
  RHFForm,
  RHFInput,
  RHFSelect,
  RHFTextarea,
  type Option,
} from "@/components/hook-form"
import {
  createEmployee,
  DuplicateEmployeeError,
  updateEmployee,
} from "@/lib/employee-service"
import {
  attendTypeOptions,
  employeeSchema,
  statusOptions,
  toEmployeeInput,
  type EmployeeFormValues,
} from "./employee-schema"
import { EMPLOYEE_LIST_PATH } from "./constants"

interface EmployeeFormProps {
  mode: "create" | "edit"
  employeeId?: number
  defaultValues: EmployeeFormValues
  /** Business options for the FK select (fetched server-side). */
  businessOptions: Option[]
}

/**
 * Shared create/edit form for an Employee. Built entirely from the reusable RHF
 * field library; on success it returns to the list and refreshes it.
 */
export function EmployeeForm({
  mode,
  employeeId,
  defaultValues,
  businessOptions,
}: EmployeeFormProps) {
  const router = useRouter()

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    mode: "onBlur",
    defaultValues,
  })

  const onSubmit = React.useCallback(
    async (values: EmployeeFormValues) => {
      const input = toEmployeeInput(values)
      try {
        if (mode === "edit" && employeeId != null) {
          await updateEmployee(employeeId, input)
        } else {
          await createEmployee(input)
        }
        router.push(EMPLOYEE_LIST_PATH)
        router.refresh()
      } catch (error) {
        if (error instanceof DuplicateEmployeeError) {
          // The backend message names the colliding unique field.
          const field = error.message.toLowerCase().includes("nic")
            ? "nic"
            : "empNo"
          form.setError(field, { type: "manual", message: error.message })
          return
        }
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [mode, employeeId, router, form],
  )

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid max-w-xl gap-7">
      <RHFSelect<EmployeeFormValues>
        name="businessId"
        label="Business"
        required
        options={businessOptions}
        placeholder="Select a business"
        triggerClassName="w-full sm:w-60"
      />
      <RHFInput<EmployeeFormValues>
        name="empNo"
        label="Employee Number"
        required
        placeholder="Enter employee number"
        maxLength={20}
      />
      <RHFInput<EmployeeFormValues>
        name="nic"
        label="NIC No"
        required
        placeholder="Enter NIC number"
        maxLength={12}
      />
      <RHFInput<EmployeeFormValues>
        name="name"
        label="Employee Name"
        required
        placeholder="Enter employee name"
        maxLength={100}
      />
      <RHFInput<EmployeeFormValues>
        name="mobile1"
        label="Mobile No 1"
        placeholder="Optional mobile number"
        maxLength={10}
      />
      <RHFInput<EmployeeFormValues>
        name="mobile2"
        label="Mobile No 2"
        placeholder="Optional mobile number"
        maxLength={10}
      />
      <RHFTextarea<EmployeeFormValues>
        name="address"
        label="Address"
        placeholder="Optional address"
        maxLength={100}
      />
      <RHFDatePicker<EmployeeFormValues>
        name="dob"
        label="Date of Birth"
        placeholder="Select date of birth"
      />
      <RHFSelect<EmployeeFormValues>
        name="attendType"
        label="Attendance Type"
        required
        options={attendTypeOptions}
        triggerClassName="w-full sm:w-60"
      />
      <RHFSelect<EmployeeFormValues>
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
          {submitting ? "Saving…" : mode === "edit" ? "Update" : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => router.push(EMPLOYEE_LIST_PATH)}
        >
          Cancel
        </Button>
      </div>
    </RHFForm>
  )
}
