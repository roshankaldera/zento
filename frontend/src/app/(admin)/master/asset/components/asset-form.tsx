"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  RHFForm,
  RHFInput,
  RHFSelect,
  RHFTextarea,
  type Option,
} from "@/components/hook-form"
import {
  createAsset,
  DuplicateAssetNameError,
  updateAsset,
} from "@/lib/asset-service"
import {
  assetSchema,
  statusOptions,
  toAssetInput,
  typeOptions,
  type AssetFormValues,
} from "./asset-schema"
import { ASSET_LIST_PATH } from "./constants"

interface AssetFormProps {
  mode: "create" | "edit"
  assetId?: number
  defaultValues: AssetFormValues
  businessOptions: Option[]
}

/**
 * Shared create/edit form for an Asset. Built from the reusable RHF field
 * library; on success it returns to the list and refreshes it.
 */
export function AssetForm({
  mode,
  assetId,
  defaultValues,
  businessOptions,
}: AssetFormProps) {
  const router = useRouter()

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    mode: "onBlur",
    defaultValues,
  })

  const onSubmit = React.useCallback(
    async (values: AssetFormValues) => {
      const input = toAssetInput(values)
      try {
        if (mode === "edit" && assetId != null) {
          await updateAsset(assetId, input)
          toast.success("Asset updated.")
        } else {
          await createAsset(input)
          toast.success("Asset created.")
        }
        router.push(ASSET_LIST_PATH)
        router.refresh()
      } catch (error) {
        if (error instanceof DuplicateAssetNameError) {
          form.setError("name", {
            type: "manual",
            message: "An asset with this name already exists",
          })
          return
        }
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [mode, assetId, router, form],
  )

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid max-w-xl gap-5">
      <RHFSelect<AssetFormValues>
        name="businessId"
        label="Business"
        required
        options={businessOptions}
        placeholder="Select a business"
        triggerClassName="w-full sm:w-60"
      />
      <RHFInput<AssetFormValues>
        name="name"
        label="Name"
        required
        placeholder="Enter asset name"
        maxLength={100}
      />
      <RHFSelect<AssetFormValues>
        name="type"
        label="Type"
        required
        options={typeOptions}
        triggerClassName="w-full sm:w-60"
      />
      <RHFSelect<AssetFormValues>
        name="status"
        label="Status"
        required
        options={statusOptions}
        triggerClassName="w-full sm:w-60"
      />
      <RHFTextarea<AssetFormValues>
        name="remark"
        label="Remark"
        placeholder="Optional notes"
        maxLength={100}
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
          onClick={() => router.push(ASSET_LIST_PATH)}
        >
          Cancel
        </Button>
      </div>
    </RHFForm>
  )
}
