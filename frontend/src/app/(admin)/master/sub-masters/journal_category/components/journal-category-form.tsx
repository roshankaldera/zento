"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { RHFForm, RHFInput, RHFSelect, RHFTextarea } from "@/components/hook-form"
import {
  createJournalCategory,
  DuplicateJournalCategoryNameError,
  updateJournalCategory,
} from "@/lib/journal-category-service"
import {
  journalCategorySchema,
  statusOptions,
  toJournalCategoryInput,
  type JournalCategoryFormValues,
} from "./journal-category-schema"
import { JOURNAL_CATEGORY_LIST_PATH } from "./constants"

interface JournalCategoryFormProps {
  mode: "create" | "edit"
  journalCategoryId?: number
  defaultValues: JournalCategoryFormValues
}

/**
 * Shared create/edit form for a Journal Category. Built entirely from the
 * reusable RHF field library; on success it returns to the list and refreshes it.
 */
export function JournalCategoryForm({
  mode,
  journalCategoryId,
  defaultValues,
}: JournalCategoryFormProps) {
  const router = useRouter()

  const form = useForm<JournalCategoryFormValues>({
    resolver: zodResolver(journalCategorySchema),
    mode: "onBlur",
    defaultValues,
  })

  const onSubmit = React.useCallback(
    async (values: JournalCategoryFormValues) => {
      const input = toJournalCategoryInput(values)
      try {
        if (mode === "edit" && journalCategoryId != null) {
          await updateJournalCategory(journalCategoryId, input)
          toast.success("Journal category updated.")
        } else {
          await createJournalCategory(input)
          toast.success("Journal category created.")
        }
        router.push(JOURNAL_CATEGORY_LIST_PATH)
        router.refresh()
      } catch (error) {
        if (error instanceof DuplicateJournalCategoryNameError) {
          form.setError("name", {
            type: "manual",
            message: "A journal category with this name already exists",
          })
          return
        }
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [mode, journalCategoryId, router, form],
  )

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid max-w-xl gap-5">
      <RHFInput<JournalCategoryFormValues>
        name="name"
        label="Name"
        required
        placeholder="Enter journal category name"
        maxLength={50}
      />
      <RHFTextarea<JournalCategoryFormValues>
        name="remark"
        label="Remark"
        placeholder="Optional notes"
        maxLength={50}
      />
      <RHFSelect<JournalCategoryFormValues>
        name="status"
        label="Status"
        required
        options={statusOptions}
        triggerClassName="w-full sm:w-60"
      />

      {rootError && (
        <p className="text-sm text-destructive" role="alert">
          {rootError}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : mode === "edit" ? "Update" : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => router.push(JOURNAL_CATEGORY_LIST_PATH)}
        >
          Cancel
        </Button>
      </div>
    </RHFForm>
  )
}
