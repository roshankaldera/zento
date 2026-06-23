import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type {
  Inventory,
  InventoryStatus,
  InventoryUom,
} from "@/types/inventory"

/**
 * One inventory stock line. `businessId` is committed as a string (Radix
 * autocomplete); `quantity`/`avgCost` are real numbers. Mapped back at the
 * submit boundary (see `toInventoryInput`).
 */
const lineSchema = z.object({
  businessId: z.string().min(1, "Business is required"),
  quantity: z.number({ error: "Quantity is required" }).min(0, "Cannot be negative"),
  avgCost: z.number({ error: "Cost is required" }).min(0, "Cannot be negative"),
})

/**
 * Inventory form contract. `applicableBusinesses` is a string[] of business ids
 * (multi-select); `uom`/`status` are strings; `lines` holds ≥1 stock row.
 */
export const inventorySchema = z.object({
  applicableBusinesses: z
    .array(z.string())
    .min(1, "Select at least one applicable business"),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer"),
  uom: z.enum(["1", "2", "3", "4", "5"]),
  status: z.enum(["1", "2"]),
  lines: z.array(lineSchema).min(1, "Add at least one line"),
})

export type InventoryFormValues = z.infer<typeof inventorySchema>
export type InventoryLineFormValues = z.infer<typeof lineSchema>

/** UOM dropdown options (value matches the tinyint stored in the DB). */
export const uomOptions: Option[] = [
  { label: "Nos", value: "1" },
  { label: "KG", value: "2" },
  { label: "Gram", value: "3" },
  { label: "Liter", value: "4" },
  { label: "Mililiter", value: "5" },
]

/** Human label for a stored UOM. */
export const uomLabel = (uom: number): string =>
  uomOptions.find((o) => o.value === String(uom))?.label ?? "—"

/** Status dropdown options (value matches the tinyint stored in the DB). */
export const statusOptions: Option[] = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "2" },
]

/** Format a numeric value (Prisma serializes decimals as strings). */
export const formatNumber = (value: number | string): string =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

/** A blank stock line, appended whenever the user clicks "Add line". */
export const emptyInventoryLine: InventoryLineFormValues = {
  businessId: "",
  quantity: 0,
  avgCost: 0,
}

/** Default values for the create form (one empty line to start). */
export const inventoryFormDefaults: InventoryFormValues = {
  applicableBusinesses: [],
  name: "",
  uom: "1",
  status: "1",
  lines: [{ ...emptyInventoryLine }],
}

/** Map a loaded record into form values (numbers -> strings). */
export function toInventoryFormValues(
  inventory: Inventory,
): InventoryFormValues {
  return {
    applicableBusinesses: inventory.applicableBusinesses.map(String),
    name: inventory.name,
    uom: String(inventory.uom) as InventoryFormValues["uom"],
    status: String(inventory.status) as InventoryFormValues["status"],
    lines: (inventory.lines ?? []).map((line) => ({
      businessId: String(line.businessId),
      quantity: Number(line.quantity),
      avgCost: Number(line.avgCost),
    })),
  }
}

/** Map submitted form values into the service input (strings -> numbers). */
export function toInventoryInput(values: InventoryFormValues) {
  return {
    applicableBusinesses: values.applicableBusinesses.map(Number),
    name: values.name.trim(),
    uom: Number(values.uom) as InventoryUom,
    status: Number(values.status) as InventoryStatus,
    lines: values.lines.map((line) => ({
      businessId: Number(line.businessId),
      quantity: line.quantity,
      avgCost: line.avgCost,
    })),
  }
}
