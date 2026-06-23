import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type {
  Business,
  BusinessLine,
  BusinessStatus,
  BusinessType,
  CreateBusinessLineInput,
} from "@/types/business"

/**
 * A Business child line (Estate Division when type=Estate, Villa Room when
 * type=Villa). Both share this shape; `status` is a string in the form.
 */
const lineSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or fewer"),
  remark: z
    .string()
    .trim()
    .max(50, "Remark must be 50 characters or fewer")
    .optional(),
  status: z.enum(["1", "2"]),
})

/**
 * Business form contract. `type` and `status` are committed as strings because
 * Radix Select only deals in strings; they are mapped back to the numeric
 * {@link BusinessType} / {@link BusinessStatus} at the submit boundary (see
 * `toBusinessInput`). `lines` holds Estate Divisions / Villa Rooms (only shown
 * for those types) and is routed to the matching payload array on submit.
 */
export const businessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Business name is required")
    .max(100, "Name must be 100 characters or fewer"),
  type: z.enum(["1", "2", "3", "4"]),
  contactPerson: z
    .string()
    .trim()
    .max(100, "Contact person must be 100 characters or fewer")
    .optional(),
  remark: z
    .string()
    .trim()
    .max(100, "Remark must be 100 characters or fewer")
    .optional(),
  status: z.enum(["1", "2"]),
  lines: z.array(lineSchema),
})

export type BusinessFormValues = z.infer<typeof businessSchema>
export type BusinessLineFormValues = z.infer<typeof lineSchema>

/** Type dropdown options (value matches the tinyint stored in the DB). */
export const typeOptions: Option[] = [
  { label: "Estate", value: "1" },
  { label: "Villa", value: "2" },
  { label: "Property", value: "3" },
  { label: "Investment", value: "4" },
]

/** Human label for a stored business type. */
export const businessTypeLabel = (type: number): string =>
  typeOptions.find((o) => o.value === String(type))?.label ?? "—"

/** Status dropdown options (value matches the tinyint stored in the DB). */
export const statusOptions: Option[] = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "2" },
]

/** Estate = 1, Villa = 2 — the two types that carry child lines. */
export const ESTATE_TYPE = "1"
export const VILLA_TYPE = "2"

/** Heading + Add button label for the line table, per selected type. */
export const lineTableLabel = (type: string): string =>
  type === ESTATE_TYPE
    ? "Estate Divisions"
    : type === VILLA_TYPE
      ? "Villa Rooms"
      : "Lines"

/** A blank line, appended whenever the user clicks "Add". */
export const emptyBusinessLine: BusinessLineFormValues = {
  name: "",
  remark: "",
  status: "1",
}

/** Default values for the create form. */
export const businessFormDefaults: BusinessFormValues = {
  name: "",
  type: "1",
  contactPerson: "",
  remark: "",
  status: "1",
  lines: [],
}

function lineToFormValues(line: BusinessLine): BusinessLineFormValues {
  return {
    name: line.name,
    remark: line.remark ?? "",
    status: String(line.status) as BusinessLineFormValues["status"],
  }
}

/** Map a loaded record into form values (number type/status -> string). */
export function toBusinessFormValues(business: Business): BusinessFormValues {
  const source =
    business.type === 1
      ? (business.estateDivisions ?? [])
      : business.type === 2
        ? (business.villaRooms ?? [])
        : []
  return {
    name: business.name,
    type: String(business.type) as BusinessFormValues["type"],
    contactPerson: business.contactPerson ?? "",
    remark: business.remark ?? "",
    status: String(business.status) as BusinessFormValues["status"],
    lines: source.map(lineToFormValues),
  }
}

/** Map submitted form values into the service input (string -> number). */
export function toBusinessInput(values: BusinessFormValues) {
  const type = Number(values.type) as BusinessType
  const lines: CreateBusinessLineInput[] = values.lines.map((line) => ({
    name: line.name.trim(),
    remark: line.remark?.trim() ? line.remark.trim() : null,
    status: Number(line.status) as BusinessStatus,
  }))
  return {
    name: values.name,
    type,
    contactPerson: values.contactPerson ?? "",
    remark: values.remark ?? "",
    status: Number(values.status) as BusinessStatus,
    estateDivisions: type === 1 ? lines : [],
    villaRooms: type === 2 ? lines : [],
  }
}
