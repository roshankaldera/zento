"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ERPDataTable } from "@/components/data-table"
import { CropApiError, deleteCrop } from "@/lib/crop-service"
import type { Crop } from "@/types/crop"
import { getCropColumns } from "./crop-columns"
import { CROP_NEW_PATH, cropEditPath } from "./constants"

interface CropListScreenProps {
  /** List fetched on the server (RSC) so the table paints populated. */
  initialCrops: Crop[]
  /** Set when the server-side fetch failed. */
  error?: string | null
}

/**
 * Crop list screen. Data is fetched on the server and handed in via
 * `initialCrops`, so there is no client fetch-on-mount waterfall. Mutations call
 * `router.refresh()`, which re-runs the server component and streams the fresh
 * list back into this component as new props.
 */
export function CropListScreen({ initialCrops, error = null }: CropListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  // Prefetch the create route so navigating to the form feels instant.
  React.useEffect(() => {
    router.prefetch(CROP_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (crop: Crop) => {
      try {
        await deleteCrop(crop.id)
        toast.success("Crop deleted.")
        refresh()
      } catch (err) {
        toast.error(
          err instanceof CropApiError
            ? err.message
            : "Failed to delete crop. Please try again.",
        )
      }
    },
    [refresh]
  )

  const columns = React.useMemo(
    () =>
      getCropColumns({
        onEdit: (crop) => router.push(cropEditPath(crop.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete]
  )

  return (
    <ERPDataTable
      title="Crops"
      description="Manage crop sub-master records."
      columns={columns}
      data={initialCrops}
      loading={isPending}
      error={error}
      getRowId={(c) => String(c.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="crops"
      searchPlaceholder="Search crops..."
      emptyMessage="No crops yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(CROP_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
