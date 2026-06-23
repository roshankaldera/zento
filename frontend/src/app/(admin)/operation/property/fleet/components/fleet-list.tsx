"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ERPDataTable } from "@/components/data-table"
import { deleteFleet } from "@/lib/fleet-service"
import type { Fleet } from "@/types/fleet"
import { getFleetColumns } from "./fleet-columns"
import { FLEET_NEW_PATH, fleetEditPath } from "./constants"

interface FleetListScreenProps {
  initialFleets: Fleet[]
  error?: string | null
}

export function FleetListScreen({
  initialFleets,
  error = null,
}: FleetListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(FLEET_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (fleet: Fleet) => {
      await deleteFleet(fleet.id)
      refresh()
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getFleetColumns({
        onEdit: (fleet) => router.push(fleetEditPath(fleet.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Fleet"
      description="Manage fleet vehicle records."
      columns={columns}
      data={initialFleets}
      loading={isPending}
      error={error}
      getRowId={(f) => String(f.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="fleet"
      searchPlaceholder="Search by vehicle no..."
      emptyMessage="No fleet records yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(FLEET_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
