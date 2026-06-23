"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader, DataTableRowActions } from "@/components/data-table"
import type { Account } from "@/types/account"

export interface AccountColumnHandlers {
  onEdit?: (account: Account) => void
  onDelete?: (account: Account) => void
}

export function getAccountColumns({
  onEdit,
  onDelete,
}: AccountColumnHandlers = {}): ColumnDef<Account>[] {
  return [
    {
      id: "business",
      accessorFn: (a) => a.business?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Business" />
      ),
      cell: ({ row }) =>
        row.original.business?.name ? (
          <span className="text-sm">{row.original.business.name}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
      meta: {
        exportHeader: "Business",
        exportValue: (a: Account) => a.business?.name ?? "",
      },
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.getValue("code")}
        </span>
      ),
      meta: { exportHeader: "Code" },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => <span className="text-sm">{row.getValue("name")}</span>,
      meta: { exportHeader: "Name" },
    },
    {
      id: "group",
      accessorFn: (a) => a.group?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Group" />
      ),
      cell: ({ row }) =>
        row.original.group?.name ? (
          <span className="text-sm">{row.original.group.name}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
      meta: {
        exportHeader: "Group",
        exportValue: (a: Account) => a.group?.name ?? "",
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
        exportValue: (a: Account) => (a.status === 1 ? "Active" : "Inactive"),
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
