"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { RHFForm, RHFInput, RHFSelect, RHFTextarea } from "@/components/hook-form"
import {
  createInventoryGroup,
  DuplicateInventoryGroupNameError,
  updateInventoryGroup,
} from "@/lib/inventory-group-service"
import {
  inventoryGroupSchema,
  statusOptions,
  toInventoryGroupInput,
  type InventoryGroupFormValues,
} from "./inventory-group-schema"
import { INVENTORY_GROUP_LIST_PATH } from "./constants"

interface InventoryGroupFormProps {
  mode: "create" | "edit"
  inventoryGroupId?: number
  defaultValues: InventoryGroupFormValues
}

/**
 * Shared create/edit form for an Inventory Group. Built entirely from the
 * reusable RHF field library; on success it returns to the list and refreshes it.
 */
export function InventoryGroupForm({
  mode,
  inventoryGroupId,
  defaultValues,
}: InventoryGroupFormProps) {
  const router = useRouter()

  const form = useForm<InventoryGroupFormValues>({
    resolver: zodResolver(inventoryGroupSchema),
    mode: "onBlur",
    defaultValues,
  })

  const onSubmit = React.useCallback(
    async (values: InventoryGroupFormValues) => {
      const input = toInventoryGroupInput(values)
      try {
        if (mode === "edit" && inventoryGroupId != null) {
          await updateInventoryGroup(inventoryGroupId, input)
        } else {
          await createInventoryGroup(input)
        }
        router.push(INVENTORY_GROUP_LIST_PATH)
        router.refresh()
      } catch (error) {
        if (error instanceof DuplicateInventoryGroupNameError) {
          form.setError("name", {
            type: "manual",
            message: "An inventory group with this name already exists",
          })
          return
        }
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [mode, inventoryGroupId, router, form],
  )

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid max-w-xl gap-5">
      <RHFInput<InventoryGroupFormValues>
        name="name"
        label="Name"
        required
        placeholder="Enter inventory group name"
        maxLength={50}
      />
      <RHFTextarea<InventoryGroupFormValues>
        name="remark"
        label="Remark"
        placeholder="Optional notes"
        maxLength={50}
      />
      <RHFSelect<InventoryGroupFormValues>
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
          onClick={() => router.push(INVENTORY_GROUP_LIST_PATH)}
        >
          Cancel
        </Button>
      </div>
    </RHFForm>
  )
}
