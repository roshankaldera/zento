import { format, parseISO } from "date-fns"
import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type { KotIngredient, KotIngredientUom } from "@/types/kot-ingredient"

/**
 * One KOT ingredient line. `uom` is committed as a string (Radix Select);
 * `requestQuantity`/`receivedQuantity` are real numbers; `item`/`remark` are
 * strings. Mapped back at the submit boundary (see `toKotIngredientInput`).
 */
const lineSchema = z.object({
  item: z
    .string()
    .trim()
    .min(1, "Item is required")
    .max(100, "Item must be 100 characters or fewer"),
  uom: z.enum(["1", "2", "3", "4", "5"]),
  requestQuantity: z
    .number({ error: "Request quantity is required" })
    .min(0, "Cannot be negative"),
  receivedQuantity: z
    .number({ error: "Received quantity is required" })
    .min(0, "Cannot be negative"),
  remark: z
    .string()
    .trim()
    .max(100, "Remark must be 100 characters or fewer")
    .optional(),
})

/**
 * KOT Ingredient form contract. `kotIds` is a string[] (multi-select values);
 * `date` is a real `Date` (date picker); `lines` always holds at least one row.
 */
export const kotIngredientSchema = z.object({
  kotIds: z.array(z.string()).min(1, "Select at least one KOT"),
  date: z.date({ error: "Date is required" }),
  remark: z
    .string()
    .trim()
    .max(100, "Description must be 100 characters or fewer")
    .optional(),
  lines: z.array(lineSchema).min(1, "Add at least one line"),
})

export type KotIngredientFormValues = z.infer<typeof kotIngredientSchema>
export type KotIngredientLineFormValues = z.infer<typeof lineSchema>

/** UOM dropdown options (value matches the tinyint stored in the DB). */
export const uomOptions: Option[] = [
  { label: "Nos", value: "1" },
  { label: "KG", value: "2" },
  { label: "Gram", value: "3" },
  { label: "Liter", value: "4" },
  { label: "Milliliter", value: "5" },
]

/** Human label for a stored UOM. */
export const uomLabel = (uom: number): string =>
  uomOptions.find((o) => o.value === String(uom))?.label ?? "—"

/** A blank line, appended whenever the user clicks "Add line". */
export const emptyKotIngredientLine: KotIngredientLineFormValues = {
  item: "",
  uom: "1",
  requestQuantity: 0,
  receivedQuantity: 0,
  remark: "",
}

/** Default values for the create form (one empty line to start). */
export const kotIngredientFormDefaults: KotIngredientFormValues = {
  kotIds: [],
  // Validation enforces a real date on submit; the picker handles `undefined`.
  date: undefined as unknown as Date,
  remark: "",
  lines: [{ ...emptyKotIngredientLine }],
}

/** Map a loaded record into form values (numbers -> strings, ISO -> Date). */
export function toKotIngredientFormValues(
  kotIngredient: KotIngredient,
): KotIngredientFormValues {
  return {
    kotIds: kotIngredient.kotIds.map(String),
    date: parseISO(kotIngredient.date.slice(0, 10)),
    remark: kotIngredient.remark ?? "",
    lines: (kotIngredient.lines ?? []).map((line) => ({
      item: line.item,
      uom: String(line.uom) as KotIngredientLineFormValues["uom"],
      requestQuantity: Number(line.requestQuantity),
      receivedQuantity: Number(line.receivedQuantity),
      remark: line.remark ?? "",
    })),
  }
}

/** Map submitted form values into the service input (strings -> numbers). */
export function toKotIngredientInput(values: KotIngredientFormValues) {
  const remark = values.remark?.trim()
  return {
    kotIds: values.kotIds.map(Number),
    date: format(values.date, "yyyy-MM-dd"),
    remark: remark ? remark : null,
    lines: values.lines.map((line) => {
      const lineRemark = line.remark?.trim()
      return {
        item: line.item.trim(),
        uom: Number(line.uom) as KotIngredientUom,
        requestQuantity: line.requestQuantity,
        receivedQuantity: line.receivedQuantity,
        remark: lineRemark ? lineRemark : null,
      }
    }),
  }
}
