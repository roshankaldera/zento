import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type { Crop, CropStatus } from "@/types/crop"

/**
 * Crop form contract. `status` is committed as a string because Radix Select
 * only deals in strings; it is mapped back to the numeric {@link CropStatus} at
 * the submit boundary (see `toCropInput`).
 */
export const cropSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Crop name is required")
    .max(50, "Name must be 50 characters or fewer"),
  remark: z
    .string()
    .trim()
    .max(50, "Remark must be 50 characters or fewer")
    .optional(),
  status: z.enum(["1", "2"]),
})

export type CropFormValues = z.infer<typeof cropSchema>

/** Status dropdown options (value matches the tinyint stored in the DB). */
export const statusOptions: Option[] = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "2" },
]

/** Default values for the create form. */
export const cropFormDefaults: CropFormValues = {
  name: "",
  remark: "",
  status: "1",
}

/** Map a loaded crop into form values (number status -> string). */
export function toCropFormValues(crop: Crop): CropFormValues {
  return {
    name: crop.name,
    remark: crop.remark ?? "",
    status: String(crop.status) as CropFormValues["status"],
  }
}

/** Map submitted form values into the service input (string status -> number). */
export function toCropInput(values: CropFormValues) {
  return {
    name: values.name,
    remark: values.remark ?? "",
    status: Number(values.status) as CropStatus,
  }
}
