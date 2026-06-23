"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ERPDataTable } from "@/components/data-table"
import { deleteLatexHarvest } from "@/lib/latex-harvest-service"
import type { LatexHarvest } from "@/types/latex-harvest"
import { getLatexHarvestColumns } from "./latex-harvest-columns"
import { LATEX_HARVEST_NEW_PATH, latexHarvestEditPath } from "./constants"

interface LatexHarvestListScreenProps {
  initialLatexHarvests: LatexHarvest[]
  error?: string | null
}

export function LatexHarvestListScreen({
  initialLatexHarvests,
  error = null,
}: LatexHarvestListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(LATEX_HARVEST_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (row: LatexHarvest) => {
      await deleteLatexHarvest(row.id)
      refresh()
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getLatexHarvestColumns({
        onEdit: (row) => router.push(latexHarvestEditPath(row.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Latex Harvests"
      description="Manage estate latex harvest records."
      columns={columns}
      data={initialLatexHarvests}
      loading={isPending}
      error={error}
      getRowId={(h) => String(h.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="latex-harvests"
      searchPlaceholder="Search by estate..."
      emptyMessage="No latex harvests yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(LATEX_HARVEST_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
