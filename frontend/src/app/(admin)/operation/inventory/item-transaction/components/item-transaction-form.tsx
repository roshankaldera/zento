"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  useFieldArray,
  useFormContext,
  useWatch,
  useForm,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

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
import type { ItemWithStock } from "@/lib/item-transaction-service"
import {
  createItemTransaction,
  DuplicateItemTransactionError,
  updateItemTransaction,
} from "@/lib/item-transaction-service"
import {
  emptyLine,
  itemTransactionSchema,
  toItemTransactionInput,
  typeOptions,
  type ItemTransactionFormValues,
} from "./item-transaction-schema"
import { ITEM_TRANSACTION_LIST_PATH } from "./constants"
import { Trash2 } from "lucide-react"

interface ItemTransactionFormProps {
  mode: "create" | "edit"
  itemTransactionId?: number
  defaultValues: ItemTransactionFormValues
  /** Business options for the header FK select. */
  businessOptions: Option[]
  /** Employee options for the optional "Request By" autocomplete. */
  employeeOptions: Option[]
  /** Inventory items + per-business stock, driving the line editor. */
  items: ItemWithStock[]
}

/** Find the stock row for a given item id + business id (both as strings). */
function findStock(
  items: ItemWithStock[],
  itemId: string | undefined,
  businessId: string | undefined,
) {
  const id = Number(itemId)
  const biz = Number(businessId)
  if (!id || !biz) return undefined
  return items
    .find((i) => i.id === id)
    ?.stock.find((s) => s.businessId === biz)
}

/** A disabled, read-only display box for a derived value. */
function ReadOnlyCell({ value }: { value: string }) {
  return (
    <div className="flex h-10 items-center rounded-lg border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
      {value}
    </div>
  )
}

interface LineRowProps {
  index: number
  itemOptions: Option[]
  items: ItemWithStock[]
  businessId: string | undefined
  onRemove: () => void
  disableRemove: boolean
}

/**
 * One editable transaction line. When an item is selected we auto-load its
 * cost (avg cost in the inventory master) into the price field and display the
 * available quantity for the selected business (view-only, never submitted).
 */
function LineRow({
  index,
  itemOptions,
  items,
  businessId,
  onRemove,
  disableRemove,
}: LineRowProps) {
  const { control, setValue } = useFormContext<ItemTransactionFormValues>()
  const itemId = useWatch({ control, name: `lines.${index}.itemId` })
  const quantity = useWatch({ control, name: `lines.${index}.quantity` })
  const price = useWatch({ control, name: `lines.${index}.price` })

  const stock = findStock(items, itemId, businessId)
  const available = stock?.quantity ?? null
  const lineTotal = (Number(quantity) || 0) * (Number(price) || 0)

  // Auto-load price = item cost only when the selection actually changes, so a
  // record loaded for edit keeps its stored price until the user re-picks.
  const prevItem = React.useRef(itemId)
  React.useEffect(() => {
    if (itemId === prevItem.current) return
    prevItem.current = itemId
    if (itemId && stock) {
      setValue(`lines.${index}.price`, stock.avgCost, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }, [itemId, stock, index, setValue])

  return (
    <tr className="border-b border-gray-100 align-top last:border-0 dark:border-gray-800/60">
      <td className="px-3 py-2">
        <RHFAutocomplete<ItemTransactionFormValues>
          name={`lines.${index}.itemId`}
          options={itemOptions}
          placeholder={businessId ? "Select item" : "Select a business first"}
          searchPlaceholder="Search items..."
          emptyMessage={
            businessId ? "No items for this business." : "Select a business first."
          }
          triggerClassName="w-full"
        />
      </td>
      <td className="px-3 py-2">
        <RHFInput<ItemTransactionFormValues>
          name={`lines.${index}.description`}
          placeholder="Optional"
          maxLength={100}
        />
      </td>
      <td className="px-3 py-2">
        <RHFNumberInput<ItemTransactionFormValues>
          name={`lines.${index}.quantity`}
          allowNegative={false}
          decimalScale={2}
          placeholder="0.00"
        />
      </td>
      <td className="px-3 py-2">
        {/* Available quantity — view only, disabled, never saved. */}
        <ReadOnlyCell
          value={available != null ? available.toFixed(2) : "—"}
        />
      </td>
      <td className="px-3 py-2">
        <RHFNumberInput<ItemTransactionFormValues>
          name={`lines.${index}.price`}
          allowNegative={false}
          decimalScale={2}
          placeholder="0.00"
        />
      </td>
      <td className="px-3 py-2">
        <ReadOnlyCell value={lineTotal.toFixed(2)} />
      </td>
      <td className="px-3 py-2">
        <Button
          type="button"
          variant="outline"
          disabled={disableRemove}
          onClick={onRemove}
        >
          <Trash2 />
        </Button>
      </td>
    </tr>
  )
}

/**
 * Shared create/edit form for an Item Transaction header plus its lines. On
 * success it returns to the list and refreshes it.
 */
export function ItemTransactionForm({
  mode,
  itemTransactionId,
  defaultValues,
  businessOptions,
  employeeOptions,
  items,
}: ItemTransactionFormProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const form = useForm<ItemTransactionFormValues>({
    resolver: zodResolver(itemTransactionSchema),
    mode: "onBlur",
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  })

  const businessId = useWatch({ control: form.control, name: "businessId" })
  const watchedLines = useWatch({ control: form.control, name: "lines" })

  // Items are filtered to those applicable to the selected business.
  const itemOptions = React.useMemo<Option[]>(() => {
    const biz = Number(businessId)
    if (!biz) return []
    return items
      .filter((i) => i.applicableBusinesses.includes(biz))
      .map((i) => ({ label: i.name, value: String(i.id) }))
  }, [items, businessId])

  const grandTotal = (watchedLines ?? []).reduce(
    (sum, line) =>
      sum + (Number(line?.quantity) || 0) * (Number(line?.price) || 0),
    0,
  )

  const onSubmit = React.useCallback(
    async (values: ItemTransactionFormValues) => {
      const input = toItemTransactionInput(values)
      try {
        if (isEdit && itemTransactionId != null) {
          await updateItemTransaction(itemTransactionId, input)
          toast.success("Item transaction updated.")
        } else {
          await createItemTransaction(input)
          toast.success("Item transaction created.")
        }
        router.push(ITEM_TRANSACTION_LIST_PATH)
        router.refresh()
      } catch (error) {
        if (error instanceof DuplicateItemTransactionError) {
          form.setError("root", { type: "manual", message: error.message })
          return
        }
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [isEdit, itemTransactionId, router, form],
  )

  const rootError = form.formState.errors.root?.message
  const linesError = form.formState.errors.lines?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid gap-7">
      <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
        <RHFAutocomplete<ItemTransactionFormValues>
          name="businessId"
          label="Business"
          required
          options={businessOptions}
          placeholder="Select a business"
          searchPlaceholder="Search businesses..."
          triggerClassName="w-full"
        />
        <RHFDatePicker<ItemTransactionFormValues>
          name="date"
          label="Date"
          required
          placeholder="Select date"
          triggerClassName="w-full"
        />
        <RHFSelect<ItemTransactionFormValues>
          name="type"
          label="Type"
          required
          options={typeOptions}
          triggerClassName="w-full"
        />
        <RHFAutocomplete<ItemTransactionFormValues>
          name="requestBy"
          label="Request By"
          options={employeeOptions}
          placeholder="Select employee"
          searchPlaceholder="Search employees..."
          triggerClassName="w-full"
        />
        <RHFInput<ItemTransactionFormValues>
          name="remark"
          label="Remark"
          placeholder="Optional"
          maxLength={100}
        />
      </div>

      <hr></hr>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Items</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ ...emptyLine })}
          >
            Add line
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-muted-foreground dark:border-gray-800">
                <th className="px-3 py-2 font-medium">Item</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="w-28 px-3 py-2 font-medium">Quantity</th>
                <th className="w-28 px-3 py-2 font-medium">Available</th>
                <th className="w-28 px-3 py-2 font-medium">Price</th>
                <th className="w-28 px-3 py-2 font-medium">Total</th>
                <th className="w-24 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <LineRow
                  key={field.id}
                  index={index}
                  itemOptions={itemOptions}
                  items={items}
                  businessId={businessId}
                  onRemove={() => remove(index)}
                  disableRemove={fields.length === 1}
                />
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 dark:border-gray-800">
                <td
                  colSpan={5}
                  className="px-3 py-2 text-right font-medium"
                >
                  Total
                </td>
                <td className="px-3 py-2 font-semibold text-foreground">
                  {grandTotal.toFixed(2)}
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
          {submitting ? "Saving…" : isEdit ? "Update" : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => router.push(ITEM_TRANSACTION_LIST_PATH)}
        >
          Cancel
        </Button>
      </div>
    </RHFForm>
  )
}
