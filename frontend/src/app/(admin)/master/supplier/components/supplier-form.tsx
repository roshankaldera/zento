"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { RHFForm, RHFInput, RHFSelect } from "@/components/hook-form"
import {
  createSupplier,
  DuplicateSupplierNameError,
  updateSupplier,
} from "@/lib/supplier-service"
import {
  formatMoney,
  statusOptions,
  supplierSchema,
  toSupplierInput,
  type SupplierFormValues,
} from "./supplier-schema"
import { SUPPLIER_LIST_PATH } from "./constants"

interface SupplierFormProps {
  mode: "create" | "edit"
  supplierId?: number
  defaultValues: SupplierFormValues
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
 * Shared create/edit form for a Supplier. Balance is disabled (system-managed):
 * it starts at 0 on create and stays unchanged on edit. On success it returns to
 * the list and refreshes it.
 */
export function SupplierForm({
  mode,
  supplierId,
  defaultValues,
}: SupplierFormProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    mode: "onBlur",
    defaultValues,
  })

  const onSubmit = React.useCallback(
    async (values: SupplierFormValues) => {
      const input = toSupplierInput(values)
      // Balance is system-managed: 0 for a new supplier, unchanged on edit.
      input.balance = isEdit ? defaultValues.balance : 0
      try {
        if (isEdit && supplierId != null) {
          await updateSupplier(supplierId, input)
        } else {
          await createSupplier(input)
        }
        router.push(SUPPLIER_LIST_PATH)
        router.refresh()
      } catch (error) {
        if (error instanceof DuplicateSupplierNameError) {
          form.setError("name", {
            type: "manual",
            message: "A supplier with this name already exists",
          })
          return
        }
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [isEdit, supplierId, defaultValues, router, form],
  )

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid max-w-xl gap-5">
      <RHFInput<SupplierFormValues>
        name="name"
        label="Name"
        required
        placeholder="Enter supplier name"
        maxLength={100}
      />
      <RHFInput<SupplierFormValues>
        name="contactPerson"
        label="Contact Person"
        placeholder="Optional contact person"
        maxLength={100}
      />
      <RHFInput<SupplierFormValues>
        name="contactNo"
        label="Contact No"
        placeholder="Optional contact number"
        maxLength={10}
      />
      <ReadOnlyField label="Balance" value={formatMoney(defaultValues.balance)} />
      <RHFSelect<SupplierFormValues>
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
          {submitting ? "Saving…" : isEdit ? "Update" : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => router.push(SUPPLIER_LIST_PATH)}
        >
          Cancel
        </Button>
      </div>
    </RHFForm>
  )
}
