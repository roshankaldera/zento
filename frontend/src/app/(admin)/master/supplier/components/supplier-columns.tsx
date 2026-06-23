"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader, DataTableRowActions } from "@/components/data-table"
import type { Supplier } from "@/types/supplier"
import { formatMoney } from "./supplier-schema"

export interface SupplierColumnHandlers {
  onEdit?: (supplier: Supplier) => void
  onDelete?: (supplier: Supplier) => void
}

function optionalCell(value: string | null | undefined) {
  return value ? (
    <span className="text-sm">{value}</span>
  ) : (
    <span className="text-sm text-muted-foreground">—</span>
  )
}

export function getSupplierColumns({
  onEdit,
  onDelete,
}: SupplierColumnHandlers = {}): ColumnDef<Supplier>[] {
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
      accessorKey: "contactPerson",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contact Person" />
      ),
      cell: ({ row }) =>
        optionalCell(row.getValue<string | null>("contactPerson")),
      enableSorting: false,
      meta: { exportHeader: "Contact Person" },
    },
    {
      accessorKey: "contactNo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contact No" />
      ),
      cell: ({ row }) => optionalCell(row.getValue<string | null>("contactNo")),
      enableSorting: false,
      meta: { exportHeader: "Contact No" },
    },
    {
      accessorKey: "balance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Balance" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{formatMoney(row.getValue("balance"))}</span>
      ),
      meta: {
        exportHeader: "Balance",
        exportValue: (s: Supplier) => formatMoney(s.balance),
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
        exportValue: (s: Supplier) => (s.status === 1 ? "Active" : "Inactive"),
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
