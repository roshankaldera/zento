"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  RHFDatePicker,
  RHFForm,
  RHFInput,
  RHFMultiSelect,
  RHFNumberInput,
  RHFSelect,
  type Option,
} from "@/components/hook-form"
import {
  createKotIngredient,
  updateKotIngredient,
} from "@/lib/kot-ingredient-service"
import {
  emptyKotIngredientLine,
  kotIngredientFormDefaults,
  kotIngredientSchema,
  toKotIngredientInput,
  uomOptions,
  type KotIngredientFormValues,
} from "./kot-ingredient-schema"
import {
  KOT_INGREDIENT_LIST_PATH,
  KOT_INGREDIENT_NEW_PATH,
} from "./constants"
import { Trash2 } from "lucide-react"

/** Fresh empty form values (new kotIds / line arrays each call) for create mode. */
const freshDefaults = (): KotIngredientFormValues => ({
  ...kotIngredientFormDefaults,
  kotIds: [],
  lines: [{ ...emptyKotIngredientLine }],
})

interface KotIngredientFormProps {
  mode: "create" | "edit"
  kotIngredientId?: number
  defaultValues: KotIngredientFormValues
  /** KOT options for the kot_ids multi-select (fetched server-side). */
  kotOptions: Option[]
}

/**
 * Shared create/edit form for a KOT Ingredient header plus its lines. The
 * header references one or more KOTs (multi-select); the lines are an editable
 * table driven by `useFieldArray`. On success it returns to the list.
 */
export function KotIngredientForm({
  mode,
  kotIngredientId,
  defaultValues,
  kotOptions,
}: KotIngredientFormProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const form = useForm<KotIngredientFormValues>({
    resolver: zodResolver(kotIngredientSchema),
    mode: "onBlur",
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  })

  const onSubmit = React.useCallback(
    async (values: KotIngredientFormValues) => {
      const input = toKotIngredientInput(values)
      try {
        if (isEdit && kotIngredientId != null) {
          await updateKotIngredient(kotIngredientId, input)
          toast.success("Ingredient order updated.")
          // Update mode: switch to an empty New form after a successful save.
          router.push(KOT_INGREDIENT_NEW_PATH)
          router.refresh()
        } else {
          await createKotIngredient(input)
          toast.success("Ingredient order created.")
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
    [isEdit, kotIngredientId, router, form],
  )

  // Clear: in create mode reset to an empty form (stay); in edit mode switch
  // the page to New mode (empty create form).
  const handleClear = React.useCallback(() => {
    if (isEdit) {
      router.push(KOT_INGREDIENT_NEW_PATH)
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
        <RHFMultiSelect<KotIngredientFormValues>
          name="kotIds"
          label="KOTs"
          required
          options={kotOptions}
          placeholder="Select KOTs"
          searchPlaceholder="Search KOTs..."
          triggerClassName="w-full"
          className="sm:col-span-2"
        />
        <RHFDatePicker<KotIngredientFormValues>
          name="date"
          label="Date"
          required
          placeholder="Select date"
          triggerClassName="w-full"
        />
        <RHFInput<KotIngredientFormValues>
          name="remark"
          label="Description"
          placeholder="Optional"
          maxLength={100}
        />
      </div>

      <hr></hr>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Lines</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ ...emptyKotIngredientLine })}
          >
            Ingredients
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-muted-foreground dark:border-gray-800">
                <th className="px-3 py-2 font-medium">Item</th>
                <th className="w-36 px-3 py-2 font-medium">UOM</th>
                <th className="w-28 px-3 py-2 font-medium">Req. Qty</th>
                <th className="w-28 px-3 py-2 font-medium">Rec. Qty</th>
                <th className="px-3 py-2 font-medium">Description</th>
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
                    <RHFInput<KotIngredientFormValues>
                      name={`lines.${index}.item`}
                      placeholder="Item name"
                      maxLength={100}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <RHFSelect<KotIngredientFormValues>
                      name={`lines.${index}.uom`}
                      options={uomOptions}
                      triggerClassName="w-full"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <RHFNumberInput<KotIngredientFormValues>
                      name={`lines.${index}.requestQuantity`}
                      allowNegative={false}
                      decimalScale={2}
                      placeholder="0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <RHFNumberInput<KotIngredientFormValues>
                      name={`lines.${index}.receivedQuantity`}
                      allowNegative={false}
                      decimalScale={2}
                      placeholder="0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <RHFInput<KotIngredientFormValues>
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
          onClick={() => router.push(KOT_INGREDIENT_LIST_PATH)}
        >
          List
        </Button>
      </div>
    </RHFForm>
  )
}
