"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader, DataTableRowActions } from "@/components/data-table"
import type { Fleet } from "@/types/fleet"

export interface FleetColumnHandlers {
  onEdit?: (fleet: Fleet) => void
  onDelete?: (fleet: Fleet) => void
}

export function getFleetColumns({
  onEdit,
  onDelete,
}: FleetColumnHandlers = {}): ColumnDef<Fleet>[] {
  return [
    {
      accessorKey: "vehicleNo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Vehicle No" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.getValue("vehicleNo")}
        </span>
      ),
      meta: { exportHeader: "Vehicle No" },
    },
    {
      accessorKey: "licenseDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="License Renewal" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("licenseDate")}</span>
      ),
      enableSorting: false,
      meta: { exportHeader: "License Renewal" },
    },
    {
      accessorKey: "insuranceDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Insurance Renewal" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("insuranceDate")}</span>
      ),
      enableSorting: false,
      meta: { exportHeader: "Insurance Renewal" },
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
        exportValue: (f: Fleet) => (f.status === 1 ? "Active" : "Inactive"),
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
