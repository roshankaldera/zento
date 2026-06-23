"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ERPDataTable } from "@/components/data-table"
import { deleteInventory } from "@/lib/inventory-service"
import type { Inventory } from "@/types/inventory"
import { getInventoryColumns } from "./inventory-columns"
import { INVENTORY_NEW_PATH, inventoryEditPath } from "./constants"

interface InventoryListScreenProps {
  initialInventories: Inventory[]
  error?: string | null
}

export function InventoryListScreen({
  initialInventories,
  error = null,
}: InventoryListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(INVENTORY_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (inventory: Inventory) => {
      await deleteInventory(inventory.id)
      refresh()
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getInventoryColumns({
        onEdit: (inventory) => router.push(inventoryEditPath(inventory.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Inventory"
      description="Manage inventory items and per-business stock."
      columns={columns}
      data={initialInventories}
      loading={isPending}
      error={error}
      getRowId={(i) => String(i.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="inventory"
      searchPlaceholder="Search by name..."
      emptyMessage="No inventory yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(INVENTORY_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
