"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/data-table"
import { DataTableRowActions } from "@/components/data-table"
import type { AccountCategory } from "@/types/account-category"

export interface AccountCategoryColumnHandlers {
  onEdit?: (accountCategory: AccountCategory) => void
  onDelete?: (accountCategory: AccountCategory) => void
}

/**
 * Column factory for the Account Category list. Handlers are injected by the
 * screen so the column array can be memoised with a stable identity.
 */
export function getAccountCategoryColumns({
  onEdit,
  onDelete,
}: AccountCategoryColumnHandlers = {}): ColumnDef<AccountCategory>[] {
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
        exportValue: (c) => (c.status === 1 ? "Active" : "Inactive"),
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
