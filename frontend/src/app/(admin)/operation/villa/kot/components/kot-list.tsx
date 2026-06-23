"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ERPDataTable } from "@/components/data-table"
import { deleteKot } from "@/lib/kot-service"
import type { Kot } from "@/types/kot"
import { getKotColumns } from "./kot-columns"
import { KOT_NEW_PATH, kotEditPath } from "./constants"

interface KotListScreenProps {
  initialKots: Kot[]
  error?: string | null
}

export function KotListScreen({ initialKots, error = null }: KotListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(KOT_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (kot: Kot) => {
      await deleteKot(kot.id)
      refresh()
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getKotColumns({
        onEdit: (kot) => router.push(kotEditPath(kot.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="KOTs"
      description="Manage kitchen order tickets."
      columns={columns}
      data={initialKots}
      loading={isPending}
      error={error}
      getRowId={(k) => String(k.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="kots"
      searchPlaceholder="Search by booking customer..."
      emptyMessage="No KOTs yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(KOT_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
