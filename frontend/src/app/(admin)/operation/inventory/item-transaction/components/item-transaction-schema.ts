import { format, parseISO } from "date-fns"
import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type {
  ItemTransaction,
  ItemTransactionType,
} from "@/types/item-transaction"

/**
 * One transaction line. `itemId` is committed as a string (autocomplete);
 * `quantity`/`price` are real numbers. The line `total` is derived for display
 * only (quantity * price) and recomputed authoritatively on the server, so it
 * is not part of the form contract. Mapped back at the submit boundary (see
 * `toItemTransactionInput`).
 */
const lineSchema = z.object({
  itemId: z.string().min(1, "Item is required"),
  description: z
    .string()
    .trim()
    .max(100, "Description must be 100 characters or fewer")
    .optional(),
  quantity: z
    .number({ error: "Quantity is required" })
    .min(0, "Cannot be negative"),
  price: z.number({ error: "Price is required" }).min(0, "Cannot be negative"),
})

/**
 * Item Transaction form contract. `businessId`/`requestBy` are strings
 * (autocomplete); `date` is a real `Date` (picker); `type` is a string Select;
 * `lines` always holds at least one row.
 */
export const itemTransactionSchema = z.object({
  businessId: z.string().min(1, "Business is required"),
  date: z.date({ error: "Date is required" }),
  requestBy: z.string().optional(),
  type: z.enum(["1", "2"]),
  remark: z
    .string()
    .trim()
    .max(100, "Remark must be 100 characters or fewer")
    .optional(),
  lines: z.array(lineSchema).min(1, "Add at least one line"),
})

export type ItemTransactionFormValues = z.infer<typeof itemTransactionSchema>
export type ItemTransactionLineFormValues = z.infer<typeof lineSchema>

/** Type dropdown options (value matches the tinyint stored in the DB). */
export const typeOptions: Option[] = [
  { label: "Receive", value: "1" },
  { label: "Issue", value: "2" },
]

/** Human label for a stored transaction type. */
export const typeLabel = (type: number): string =>
  typeOptions.find((o) => o.value === String(type))?.label ?? "—"

/** A blank line, appended whenever the user clicks "Add line". */
export const emptyLine: ItemTransactionLineFormValues = {
  itemId: "",
  description: "",
  quantity: 0,
  price: 0,
}

/** Default values for the create form (date = today; one empty line). */
export const itemTransactionFormDefaults: ItemTransactionFormValues = {
  businessId: "",
  date: new Date(),
  requestBy: "",
  type: "1",
  remark: "",
  lines: [{ ...emptyLine }],
}

/** Map a loaded record into form values (numbers -> strings, ISO -> Date). */
export function toItemTransactionFormValues(
  transaction: ItemTransaction,
): ItemTransactionFormValues {
  return {
    businessId: String(transaction.businessId),
    date: parseISO(transaction.date.slice(0, 10)),
    requestBy: transaction.requestBy != null ? String(transaction.requestBy) : "",
    type: String(transaction.type) as ItemTransactionFormValues["type"],
    remark: transaction.remark ?? "",
    lines: (transaction.lines ?? []).map((line) => ({
      itemId: String(line.itemId),
      description: line.description ?? "",
      quantity: Number(line.quantity),
      price: Number(line.price),
    })),
  }
}

/** Map submitted form values into the service input (strings -> numbers). */
export function toItemTransactionInput(values: ItemTransactionFormValues) {
  const remark = values.remark?.trim()
  const requestBy = values.requestBy?.trim()
  return {
    businessId: Number(values.businessId),
    date: format(values.date, "yyyy-MM-dd"),
    requestBy: requestBy ? Number(requestBy) : null,
    type: Number(values.type) as ItemTransactionType,
    remark: remark ? remark : null,
    lines: values.lines.map((line) => {
      const description = line.description?.trim()
      return {
        itemId: Number(line.itemId),
        description: description ? description : null,
        quantity: line.quantity,
        price: line.price,
      }
    }),
  }
}
