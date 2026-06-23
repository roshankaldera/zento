"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader, DataTableRowActions } from "@/components/data-table"
import type { User } from "@/types/user"

export interface UserColumnHandlers {
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
}

export function getUserColumns({
  onEdit,
  onDelete,
}: UserColumnHandlers = {}): ColumnDef<User>[] {
  return [
    {
      accessorKey: "fullName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.getValue("fullName")}
        </span>
      ),
      meta: { exportHeader: "Name" },
    },
    {
      accessorKey: "userName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="User Name" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("userName")}</span>
      ),
      meta: { exportHeader: "User Name" },
    },
    {
      id: "accessible",
      accessorFn: (u) => u.accessibleBusinesses.length,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Businesses" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.accessibleBusinesses.length}
        </span>
      ),
      enableSorting: false,
      meta: {
        exportHeader: "Businesses",
        exportValue: (u: User) => String(u.accessibleBusinesses.length),
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
        exportValue: (u: User) => (u.status === 1 ? "Active" : "Inactive"),
      },
    },
    {
      accessorKey: "remark",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Remark" />
      ),
      cell: ({ row }) =>
        row.original.remark ? (
          <span className="text-sm">{row.original.remark}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
      enableSorting: false,
      meta: {
        exportHeader: "Remark",
        exportValue: (u: User) => u.remark ?? "",
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
