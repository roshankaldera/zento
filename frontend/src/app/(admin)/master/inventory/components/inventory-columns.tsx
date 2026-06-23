"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader, DataTableRowActions } from "@/components/data-table"
import type { Inventory } from "@/types/inventory"
import { uomLabel } from "./inventory-schema"

export interface InventoryColumnHandlers {
  onEdit?: (inventory: Inventory) => void
  onDelete?: (inventory: Inventory) => void
}

function lineCount(inventory: Inventory): number {
  return inventory._count?.lines ?? inventory.lines?.length ?? 0
}

export function getInventoryColumns({
  onEdit,
  onDelete,
}: InventoryColumnHandlers = {}): ColumnDef<Inventory>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.getValue("name")}
        </span>
      ),
      meta: { exportHeader: "Name" },
    },
    {
      accessorKey: "uom",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="UOM" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{uomLabel(row.getValue<number>("uom"))}</Badge>
      ),
      meta: {
        exportHeader: "UOM",
        exportValue: (i: Inventory) => uomLabel(i.uom),
      },
    },
    {
      id: "applicable",
      accessorFn: (i) => i.applicableBusinesses.length,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Businesses" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.applicableBusinesses.length}
        </span>
      ),
      enableSorting: false,
      meta: {
        exportHeader: "Businesses",
        exportValue: (i: Inventory) => String(i.applicableBusinesses.length),
      },
    },
    {
      id: "lines",
      accessorFn: (i) => lineCount(i),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Stock Lines" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{lineCount(row.original)}</span>
      ),
      enableSorting: false,
      meta: {
        exportHeader: "Stock Lines",
        exportValue: (i: Inventory) => String(lineCount(i)),
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const active = row.getValue<number>("status") === 1
        return (
          <Badge variant={active ? "default" : "secondary"}>
            {active ? "Active" : "Inactive"}
          </Badge>
        )
      },
      meta: {
        exportHeader: "Status",
        exportValue: (i: Inventory) => (i.status === 1 ? "Active" : "Inactive"),
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DataTableRowActions row={row} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ),
    },
  ]
}
