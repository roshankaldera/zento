"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/data-table"
import { DataTableRowActions } from "@/components/data-table"
import type { Business } from "@/types/business"
import { businessTypeLabel } from "./business-schema"

export interface BusinessColumnHandlers {
  onEdit?: (business: Business) => void
  onDelete?: (business: Business) => void
}

/**
 * Column factory for the Business list. Handlers are injected by the screen so
 * the column array can be memoised with a stable identity.
 */
export function getBusinessColumns({
  onEdit,
  onDelete,
}: BusinessColumnHandlers = {}): ColumnDef<Business>[] {
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
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">
          {businessTypeLabel(row.getValue<number>("type"))}
        </Badge>
      ),
      meta: {
        exportHeader: "Type",
        exportValue: (b) => businessTypeLabel(b.type),
      },
    },
    {
      accessorKey: "contactPerson",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contact Person" />
      ),
      cell: ({ row }) => {
        const contactPerson = row.getValue<string | null>("contactPerson")
        return contactPerson ? (
          <span className="text-sm">{contactPerson}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )
      },
      enableSorting: false,
      meta: { exportHeader: "Contact Person" },
    },
    {
      accessorKey: "remark",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Remark" />
      ),
      cell: ({ row }) => {
        const remark = row.getValue<string | null>("remark")
        return remark ? (
          <span className="text-sm">{remark}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )
      },
      enableSorting: false,
      meta: { exportHeader: "Remark" },
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
        exportValue: (b) => (b.status === 1 ? "Active" : "Inactive"),
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
