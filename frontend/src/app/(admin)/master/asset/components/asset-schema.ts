import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type { Asset, AssetStatus, AssetType } from "@/types/asset"

/**
 * Asset form contract. `type` and `status` are committed as strings (Radix
 * Select only deals in strings); they are mapped back to numbers at the submit
 * boundary (see `toAssetInput`).
 */
export const assetSchema = z.object({
  businessId: z.string().min(1, "Business is required"),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer"),
  type: z.enum(["1", "2", "3", "4"]),
  status: z.enum(["1", "2"]),
  remark: z
    .string()
    .trim()
    .max(100, "Remark must be 100 characters or fewer")
    .optional(),
})

export type AssetFormValues = z.infer<typeof assetSchema>

/** Type dropdown options (value matches the tinyint stored in the DB). */
export const typeOptions: Option[] = [
  { label: "Investment", value: "1" },
  { label: "Vehicle", value: "2" },
  { label: "Building", value: "3" },
  { label: "Solar", value: "4" },
]

/** Human label for a stored asset type. */
export const assetTypeLabel = (type: number): string =>
  typeOptions.find((o) => o.value === String(type))?.label ?? "—"

/** Status dropdown options (value matches the tinyint stored in the DB). */
export const statusOptions: Option[] = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "2" },
]

/** Default values for the create form. */
export const assetFormDefaults: AssetFormValues = {
  businessId: "",
  name: "",
  type: "1",
  status: "1",
  remark: "",
}

/** Map a loaded record into form values (number type/status -> string). */
export function toAssetFormValues(asset: Asset): AssetFormValues {
  return {
    businessId: asset.businessId != null ? String(asset.businessId) : "",
    name: asset.name,
    type: String(asset.type) as AssetFormValues["type"],
    status: String(asset.status) as AssetFormValues["status"],
    remark: asset.remark ?? "",
  }
}

/** Map submitted form values into the service input (string -> number). */
export function toAssetInput(values: AssetFormValues) {
  return {
    businessId: Number(values.businessId),
    name: values.name.trim(),
    type: Number(values.type) as AssetType,
    status: Number(values.status) as AssetStatus,
    remark: values.remark ?? "",
  }
}
