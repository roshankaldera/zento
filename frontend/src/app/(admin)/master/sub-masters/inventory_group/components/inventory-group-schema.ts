import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type {
  InventoryGroup,
  InventoryGroupStatus,
} from "@/types/inventory-group"

/**
 * Inventory Group form contract. `status` is committed as a string because Radix
 * Select only deals in strings; it is mapped back to the numeric
 * {@link InventoryGroupStatus} at the submit boundary (see `toInventoryGroupInput`).
 */
export const inventoryGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Inventory group name is required")
    .max(50, "Name must be 50 characters or fewer"),
  remark: z
    .string()
    .trim()
    .max(50, "Remark must be 50 characters or fewer")
    .optional(),
  status: z.enum(["1", "2"]),
})

export type InventoryGroupFormValues = z.infer<typeof inventoryGroupSchema>

/** Status dropdown options (value matches the tinyint stored in the DB). */
export const statusOptions: Option[] = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "2" },
]

/** Default values for the create form. */
export const inventoryGroupFormDefaults: InventoryGroupFormValues = {
  name: "",
  remark: "",
  status: "1",
}

/** Map a loaded record into form values (number status -> string). */
export function toInventoryGroupFormValues(
  inventoryGroup: InventoryGroup,
): InventoryGroupFormValues {
  return {
    name: inventoryGroup.name,
    remark: inventoryGroup.remark ?? "",
    status: String(
      inventoryGroup.status,
    ) as InventoryGroupFormValues["status"],
  }
}

/** Map submitted form values into the service input (string status -> number). */
export function toInventoryGroupInput(values: InventoryGroupFormValues) {
  return {
    name: values.name,
    remark: values.remark ?? "",
    status: Number(values.status) as InventoryGroupStatus,
  }
}
