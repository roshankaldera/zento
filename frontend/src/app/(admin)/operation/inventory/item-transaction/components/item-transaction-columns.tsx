"use client"

import type { ColumnDef } from "@tanstack/react-table"

import {
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import type { ItemTransaction } from "@/types/item-transaction"
import { typeLabel } from "./item-transaction-schema"

export interface ItemTransactionColumnHandlers {
  onEdit?: (row: ItemTransaction) => void
  onDelete?: (row: ItemTransaction) => void
}

function lineCount(row: ItemTransaction): number {
  return row._count?.lines ?? row.lines?.length ?? 0
}

function optionalCell(value: string | null | undefined) {
  return value ? (
    <span className="text-sm">{value}</span>
  ) : (
    <span className="text-sm text-muted-foreground">—</span>
  )
}

export function getItemTransactionColumns({
  onEdit,
  onDelete,
}: ItemTransactionColumnHandlers = {}): ColumnDef<ItemTransaction>[] {
  return [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.getValue<string>("date").slice(0, 10)}
        </span>
      ),
      meta: {
        exportHeader: "Date",
        exportValue: (t: ItemTransaction) => t.date.slice(0, 10),
      },
    },
    {
      id: "business",
      accessorFn: (t) => t.business?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Business" />
      ),
      cell: ({ row }) => optionalCell(row.original.business?.name),
      meta: {
        exportHeader: "Business",
        exportValue: (t: ItemTransaction) => t.business?.name ?? "",
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.type === 1 ? "default" : "secondary"}>
          {typeLabel(row.original.type)}
        </Badge>
      ),
      meta: {
        exportHeader: "Type",
        exportValue: (t: ItemTransaction) => typeLabel(t.type),
      },
    },
    {
      id: "requester",
      accessorFn: (t) => t.requester?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Request By" />
      ),
      cell: ({ row }) => optionalCell(row.original.requester?.name),
      enableSorting: false,
      meta: {
        exportHeader: "Request By",
        exportValue: (t: ItemTransaction) => t.requester?.name ?? "",
      },
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{Number(row.original.total).toFixed(2)}</span>
      ),
      meta: {
        exportHeader: "Total",
        exportValue: (t: ItemTransaction) => Number(t.total).toFixed(2),
      },
    },
    {
      id: "lines",
      accessorFn: (t) => lineCount(t),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lines" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{lineCount(row.original)}</span>
      ),
      enableSorting: false,
      meta: {
        exportHeader: "Lines",
        exportValue: (t: ItemTransaction) => String(lineCount(t)),
      },
    },
    {
      accessorKey: "remark",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Remark" />
      ),
      cell: ({ row }) => optionalCell(row.original.remark),
      enableSorting: false,
      meta: {
        exportHeader: "Remark",
        exportValue: (t: ItemTransaction) => t.remark ?? "",
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
