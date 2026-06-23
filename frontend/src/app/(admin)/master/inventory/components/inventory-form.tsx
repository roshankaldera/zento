"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  RHFAutocomplete,
  RHFCurrencyInput,
  RHFForm,
  RHFInput,
  RHFMultiSelect,
  RHFNumberInput,
  RHFSelect,
  type Option,
} from "@/components/hook-form"
import {
  createInventory,
  DuplicateInventoryNameError,
  updateInventory,
} from "@/lib/inventory-service"
import {
  emptyInventoryLine,
  inventorySchema,
  statusOptions,
  toInventoryInput,
  uomOptions,
  type InventoryFormValues,
} from "./inventory-schema"
import { INVENTORY_LIST_PATH } from "./constants"

interface InventoryFormProps {
  mode: "create" | "edit"
  inventoryId?: number
  defaultValues: InventoryFormValues
  /** Business options for the applicable-businesses + per-line business fields. */
  businessOptions: Option[]
}

/**
 * Shared create/edit form for an Inventory header plus its per-business stock
 * lines. On success it returns to the list and refreshes it.
 */
export function InventoryForm({
  mode,
  inventoryId,
  defaultValues,
  businessOptions,
}: InventoryFormProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    mode: "onBlur",
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  })

  // Display-only stock value total = sum(quantity * avgCost).
  const watchedLines = useWatch({ control: form.control, name: "lines" })
  const totalValue = (watchedLines ?? []).reduce(
    (sum, line) =>
      sum + (Number(line?.quantity) || 0) * (Number(line?.avgCost) || 0),
    0,
  )

  const onSubmit = React.useCallback(
    async (values: InventoryFormValues) => {
      const input = toInventoryInput(values)
      try {
        if (isEdit && inventoryId != null) {
          await updateInventory(inventoryId, input)
        } else {
          await createInventory(input)
        }
        router.push(INVENTORY_LIST_PATH)
        router.refresh()
      } catch (error) {
        if (error instanceof DuplicateInventoryNameError) {
          form.setError("name", {
            type: "manual",
            message: "An inventory with this name already exists",
          })
          return
        }
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [isEdit, inventoryId, router, form],
  )

  const rootError = form.formState.errors.root?.message
  const linesError = form.formState.errors.lines?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid gap-7">
      <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
        <RHFInput<InventoryFormValues>
          name="name"
          label="Name"
          required
          placeholder="Enter inventory name"
          maxLength={100}
          className="sm:col-span-2"
        />
        <RHFMultiSelect<InventoryFormValues>
          name="applicableBusinesses"
          label="Applicable Businesses"
          required
          options={businessOptions}
          placeholder="Select applicable businesses"
          searchPlaceholder="Search businesses..."
          triggerClassName="w-full"
          className="sm:col-span-2"
        />
        <RHFSelect<InventoryFormValues>
          name="uom"
          label="Unit of Measurement"
          required
          options={uomOptions}
          triggerClassName="w-full"
        />
        <RHFSelect<InventoryFormValues>
          name="status"
          label="Status"
          required
          options={statusOptions}
          triggerClassName="w-full"
        />
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Stock</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ ...emptyInventoryLine })}
          >
            Add line
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-muted-foreground dark:border-gray-800">
                <th className="px-3 py-2 font-medium">Business</th>
                <th className="w-32 px-3 py-2 font-medium">Quantity</th>
                <th className="w-36 px-3 py-2 font-medium">Avg Cost</th>
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
                    <RHFAutocomplete<InventoryFormValues>
                      name={`lines.${index}.businessId`}
                      options={businessOptions}
                      placeholder="Select business"
                      searchPlaceholder="Search businesses..."
                      triggerClassName="w-full"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <RHFNumberInput<InventoryFormValues>
                      name={`lines.${index}.quantity`}
                      allowNegative={false}
                      decimalScale={2}
                      placeholder="0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <RHFCurrencyInput<InventoryFormValues>
                      name={`lines.${index}.avgCost`}
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
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 dark:border-gray-800">
                <td className="px-3 py-2 text-right font-medium" colSpan={2}>
                  Total Value
                </td>
                <td className="px-3 py-2 font-semibold text-foreground">
                  {totalValue.toFixed(2)}
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
          onClick={() => router.push(INVENTORY_LIST_PATH)}
        >
          Cancel
        </Button>
      </div>
    </RHFForm>
  )
}
