"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ERPDataTable } from "@/components/data-table"
import { CoconutHarvestApiError, deleteCoconutHarvest } from "@/lib/coconut-harvest-service"
import type { CoconutHarvest } from "@/types/coconut-harvest"
import { getCoconutHarvestColumns } from "./coconut-harvest-columns"
import {
  COCONUT_HARVEST_NEW_PATH,
  coconutHarvestEditPath,
} from "./constants"

interface CoconutHarvestListScreenProps {
  initialCoconutHarvests: CoconutHarvest[]
  error?: string | null
}

export function CoconutHarvestListScreen({
  initialCoconutHarvests,
  error = null,
}: CoconutHarvestListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(COCONUT_HARVEST_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (row: CoconutHarvest) => {
      try {
        await deleteCoconutHarvest(row.id)
        toast.success("Coconut harvest deleted.")
        refresh()
      } catch (err) {
        toast.error(
          err instanceof CoconutHarvestApiError
            ? err.message
            : "Failed to delete coconut harvest. Please try again.",
        )
      }
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getCoconutHarvestColumns({
        onEdit: (row) => router.push(coconutHarvestEditPath(row.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Coconut Harvests"
      description="Manage estate coconut harvest records."
      columns={columns}
      data={initialCoconutHarvests}
      loading={isPending}
      error={error}
      getRowId={(h) => String(h.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="coconut-harvests"
      searchPlaceholder="Search by estate..."
      emptyMessage="No coconut harvests yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(COCONUT_HARVEST_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
