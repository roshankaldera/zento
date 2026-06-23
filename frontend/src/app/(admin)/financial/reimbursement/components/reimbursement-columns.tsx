"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import {
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/data-table"
import type { Reimbursement } from "@/types/reimbursement"
import { formatMoney, statusLabel, statusVariant } from "./reimbursement-schema"

export interface ReimbursementColumnHandlers {
  onEdit?: (row: Reimbursement) => void
  onDelete?: (row: Reimbursement) => void
}

function lineCount(row: Reimbursement): number {
  return row._count?.lines ?? row.lines?.length ?? 0
}

function optionalCell(value: string | null | undefined) {
  return value ? (
    <span className="text-sm">{value}</span>
  ) : (
    <span className="text-sm text-muted-foreground">—</span>
  )
}

export function getReimbursementColumns({
  onEdit,
  onDelete,
}: ReimbursementColumnHandlers = {}): ColumnDef<Reimbursement>[] {
  return [
    {
      accessorKey: "reimbursementNo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reimbursement No" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.reimbursementNo ?? "—"}
        </span>
      ),
      meta: { exportHeader: "Reimbursement No" },
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.getValue<string>("date").slice(0, 10)}
        </span>
      ),
      meta: {
        exportHeader: "Date",
        exportValue: (r: Reimbursement) => r.date.slice(0, 10),
      },
    },
    {
      id: "business",
      accessorFn: (r) => r.business?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Business" />
      ),
      cell: ({ row }) => optionalCell(row.original.business?.name),
      meta: {
        exportHeader: "Business",
        exportValue: (r: Reimbursement) => r.business?.name ?? "",
      },
    },
    {
      accessorKey: "totalValue",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Value" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{formatMoney(row.original.totalValue)}</span>
      ),
      meta: {
        exportHeader: "Total Value",
        exportValue: (r: Reimbursement) => formatMoney(r.totalValue),
      },
    },
    {
      id: "lines",
      accessorFn: (r) => lineCount(r),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lines" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{lineCount(row.original)}</span>
      ),
      enableSorting: false,
      meta: {
        exportHeader: "Lines",
        exportValue: (r: Reimbursement) => String(lineCount(r)),
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue<number>("status")
        return (
          <Badge variant={statusVariant(status)}>{statusLabel(status)}</Badge>
        )
      },
      meta: {
        exportHeader: "Status",
        exportValue: (r: Reimbursement) => statusLabel(r.status),
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
