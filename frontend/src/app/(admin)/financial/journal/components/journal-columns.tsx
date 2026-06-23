"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import {
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/data-table"
import type { Journal } from "@/types/journal"
import { formatMoney, statusLabel, statusVariant } from "./journal-schema"

export interface JournalColumnHandlers {
  onEdit?: (row: Journal) => void
  onDelete?: (row: Journal) => void
}

function lineCount(row: Journal): number {
  return row._count?.lines ?? row.lines?.length ?? 0
}

function optionalCell(value: string | null | undefined) {
  return value ? (
    <span className="text-sm">{value}</span>
  ) : (
    <span className="text-sm text-muted-foreground">—</span>
  )
}

export function getJournalColumns({
  onEdit,
  onDelete,
}: JournalColumnHandlers = {}): ColumnDef<Journal>[] {
  return [
    {
      accessorKey: "journalNo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Journal No" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.getValue("journalNo")}
        </span>
      ),
      meta: { exportHeader: "Journal No" },
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
        exportValue: (j: Journal) => j.date.slice(0, 10),
      },
    },
    {
      id: "business",
      accessorFn: (j) => j.business?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Business" />
      ),
      cell: ({ row }) => optionalCell(row.original.business?.name),
      meta: {
        exportHeader: "Business",
        exportValue: (j: Journal) => j.business?.name ?? "",
      },
    },
    {
      id: "category",
      accessorFn: (j) => j.journalCategory?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => optionalCell(row.original.journalCategory?.name),
      enableSorting: false,
      meta: {
        exportHeader: "Category",
        exportValue: (j: Journal) => j.journalCategory?.name ?? "",
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
        exportValue: (j: Journal) => formatMoney(j.totalValue),
      },
    },
    {
      id: "lines",
      accessorFn: (j) => lineCount(j),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lines" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{lineCount(row.original)}</span>
      ),
      enableSorting: false,
      meta: {
        exportHeader: "Lines",
        exportValue: (j: Journal) => String(lineCount(j)),
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
        exportValue: (j: Journal) => statusLabel(j.status),
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
