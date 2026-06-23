"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ERPDataTable } from "@/components/data-table"
import { deleteSoloar } from "@/lib/soloar-service"
import type { Soloar } from "@/types/soloar"
import { getSoloarColumns } from "./soloar-columns"
import { SOLOAR_NEW_PATH, soloarEditPath } from "./constants"

interface SoloarListScreenProps {
  initialSoloars: Soloar[]
  error?: string | null
}

export function SoloarListScreen({
  initialSoloars,
  error = null,
}: SoloarListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(SOLOAR_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (soloar: Soloar) => {
      await deleteSoloar(soloar.id)
      refresh()
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getSoloarColumns({
        onEdit: (soloar) => router.push(soloarEditPath(soloar.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Solar"
      description="Manage solar meter readings."
      columns={columns}
      data={initialSoloars}
      loading={isPending}
      error={error}
      getRowId={(s) => String(s.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="soloars"
      searchPlaceholder="Search by solar asset..."
      emptyMessage="No solar readings yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(SOLOAR_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
