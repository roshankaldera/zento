"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { RHFForm, RHFInput, RHFSelect, RHFTextarea } from "@/components/hook-form"
import {
  createCrop,
  DuplicateCropNameError,
  updateCrop,
} from "@/lib/crop-service"
import {
  cropSchema,
  statusOptions,
  toCropInput,
  type CropFormValues,
} from "./crop-schema"
import { CROP_LIST_PATH } from "./constants"

interface CropFormProps {
  mode: "create" | "edit"
  cropId?: number
  defaultValues: CropFormValues
}

/**
 * Shared create/edit form for a Crop. Built entirely from the reusable RHF
 * field library; on success it returns to the list and refreshes it.
 */
export function CropForm({ mode, cropId, defaultValues }: CropFormProps) {
  const router = useRouter()

  const form = useForm<CropFormValues>({
    resolver: zodResolver(cropSchema),
    mode: "onBlur",
    defaultValues,
  })

  const onSubmit = React.useCallback(
    async (values: CropFormValues) => {
      const input = toCropInput(values)
      try {
        if (mode === "edit" && cropId != null) {
          await updateCrop(cropId, input)
        } else {
          await createCrop(input)
        }
        router.push(CROP_LIST_PATH)
        router.refresh()
      } catch (error) {
        if (error instanceof DuplicateCropNameError) {
          form.setError("name", {
            type: "manual",
            message: "A crop with this name already exists",
          })
          return
        }
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [mode, cropId, router, form]
  )

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm
      form={form}
      onSubmit={onSubmit}
      className="grid max-w-xl gap-5"
    >
      <RHFInput<CropFormValues>
        name="name"
        label="Name"
        required
        placeholder="Enter crop name"
        maxLength={50}
      />
      <RHFTextarea<CropFormValues>
        name="remark"
        label="Remark"
        placeholder="Optional notes"
        maxLength={50}
      />
      <RHFSelect<CropFormValues>
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
          {submitting
            ? "Saving…"
            : mode === "edit"
              ? "Update"
              : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => router.push(CROP_LIST_PATH)}
        >
          Cancel
        </Button>
      </div>
    </RHFForm>
  )
}
