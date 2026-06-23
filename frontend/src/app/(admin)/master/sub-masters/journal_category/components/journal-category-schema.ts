import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type {
  JournalCategory,
  JournalCategoryStatus,
} from "@/types/journal-category"

/**
 * Journal Category form contract. `status` is committed as a string because
 * Radix Select only deals in strings; it is mapped back to the numeric
 * {@link JournalCategoryStatus} at the submit boundary (see `toJournalCategoryInput`).
 */
export const journalCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Journal category name is required")
    .max(50, "Name must be 50 characters or fewer"),
  remark: z
    .string()
    .trim()
    .max(50, "Remark must be 50 characters or fewer")
    .optional(),
  status: z.enum(["1", "2"]),
})

export type JournalCategoryFormValues = z.infer<typeof journalCategorySchema>

/** Status dropdown options (value matches the tinyint stored in the DB). */
export const statusOptions: Option[] = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "2" },
]

/** Default values for the create form. */
export const journalCategoryFormDefaults: JournalCategoryFormValues = {
  name: "",
  remark: "",
  status: "1",
}

/** Map a loaded record into form values (number status -> string). */
export function toJournalCategoryFormValues(
  journalCategory: JournalCategory,
): JournalCategoryFormValues {
  return {
    name: journalCategory.name,
    remark: journalCategory.remark ?? "",
    status: String(
      journalCategory.status,
    ) as JournalCategoryFormValues["status"],
  }
}

/** Map submitted form values into the service input (string status -> number). */
export function toJournalCategoryInput(values: JournalCategoryFormValues) {
  return {
    name: values.name,
    remark: values.remark ?? "",
    status: Number(values.status) as JournalCategoryStatus,
  }
}
