"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader, DataTableRowActions } from "@/components/data-table"
import type { CoconutHarvest } from "@/types/coconut-harvest"

export interface CoconutHarvestColumnHandlers {
  onEdit?: (row: CoconutHarvest) => void
  onDelete?: (row: CoconutHarvest) => void
}

function lineCount(row: CoconutHarvest): number {
  return row._count?.lines ?? row.lines?.length ?? 0
}

export function getCoconutHarvestColumns({
  onEdit,
  onDelete,
}: CoconutHarvestColumnHandlers = {}): ColumnDef<CoconutHarvest>[] {
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
        exportValue: (h: CoconutHarvest) => h.date.slice(0, 10),
      },
    },
    {
      id: "estate",
      accessorFn: (h) => h.estate?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Estate" />
      ),
      cell: ({ row }) =>
        row.original.estate?.name ? (
          <span className="text-sm">{row.original.estate.name}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
      meta: {
        exportHeader: "Estate",
        exportValue: (h: CoconutHarvest) => h.estate?.name ?? "",
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
        exportValue: (h: CoconutHarvest) => h.remark ?? "",
      },
    },
    {
      id: "lines",
      accessorFn: (h) => lineCount(h),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Divisions" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{lineCount(row.original)}</span>
      ),
      enableSorting: false,
      meta: {
        exportHeader: "Divisions",
        exportValue: (h: CoconutHarvest) => String(lineCount(h)),
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
