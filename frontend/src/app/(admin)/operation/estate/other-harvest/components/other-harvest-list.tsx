"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ERPDataTable } from "@/components/data-table"
import {
  deleteOtherHarvest,
  OtherHarvestApiError,
} from "@/lib/other-harvest-service"
import type { OtherHarvest } from "@/types/other-harvest"
import { getOtherHarvestColumns } from "./other-harvest-columns"
import {
  OTHER_HARVEST_NEW_PATH,
  otherHarvestEditPath,
} from "./constants"

interface OtherHarvestListScreenProps {
  initialOtherHarvests: OtherHarvest[]
  error?: string | null
}

export function OtherHarvestListScreen({
  initialOtherHarvests,
  error = null,
}: OtherHarvestListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(OTHER_HARVEST_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (otherHarvest: OtherHarvest) => {
      try {
        await deleteOtherHarvest(otherHarvest.id)
        toast.success("Other harvest deleted.")
        refresh()
      } catch (err) {
        toast.error(
          err instanceof OtherHarvestApiError
            ? err.message
            : "Failed to delete other harvest. Please try again.",
        )
      }
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getOtherHarvestColumns({
        onEdit: (otherHarvest) =>
          router.push(otherHarvestEditPath(otherHarvest.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Other Harvest"
      description="Manage estate other-harvest records."
      columns={columns}
      data={initialOtherHarvests}
      loading={isPending}
      error={error}
      getRowId={(h) => String(h.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="other-harvest"
      searchPlaceholder="Search by reference or supplier..."
      emptyMessage="No other harvests yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(OTHER_HARVEST_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
