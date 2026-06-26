"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ERPDataTable } from "@/components/data-table"
import {
  deleteInventoryGroup,
  InventoryGroupApiError,
} from "@/lib/inventory-group-service"
import type { InventoryGroup } from "@/types/inventory-group"
import { getInventoryGroupColumns } from "./inventory-group-columns"
import {
  INVENTORY_GROUP_NEW_PATH,
  inventoryGroupEditPath,
} from "./constants"

interface InventoryGroupListScreenProps {
  /** List fetched on the server (RSC) so the table paints populated. */
  initialInventoryGroups: InventoryGroup[]
  /** Set when the server-side fetch failed. */
  error?: string | null
}

/**
 * Inventory Group list screen. Data is fetched on the server and handed in via
 * `initialInventoryGroups`, so there is no client fetch-on-mount waterfall.
 * Mutations call `router.refresh()`, which re-runs the server component and
 * streams the fresh list back into this component as new props.
 */
export function InventoryGroupListScreen({
  initialInventoryGroups,
  error = null,
}: InventoryGroupListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  // Prefetch the create route so navigating to the form feels instant.
  React.useEffect(() => {
    router.prefetch(INVENTORY_GROUP_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (inventoryGroup: InventoryGroup) => {
      try {
        await deleteInventoryGroup(inventoryGroup.id)
        toast.success("Inventory group deleted.")
        refresh()
      } catch (err) {
        toast.error(
          err instanceof InventoryGroupApiError
            ? err.message
            : "Failed to delete inventory group. Please try again.",
        )
      }
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getInventoryGroupColumns({
        onEdit: (inventoryGroup) =>
          router.push(inventoryGroupEditPath(inventoryGroup.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Inventory Groups"
      description="Manage inventory group sub-master records."
      columns={columns}
      data={initialInventoryGroups}
      loading={isPending}
      error={error}
      getRowId={(c) => String(c.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="inventory-groups"
      searchPlaceholder="Search inventory groups..."
      emptyMessage="No inventory groups yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(INVENTORY_GROUP_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
