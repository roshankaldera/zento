"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader, DataTableRowActions } from "@/components/data-table"
import type { LatexHarvest } from "@/types/latex-harvest"

export interface LatexHarvestColumnHandlers {
  onEdit?: (row: LatexHarvest) => void
  onDelete?: (row: LatexHarvest) => void
}

function lineCount(row: LatexHarvest): number {
  return row._count?.lines ?? row.lines?.length ?? 0
}

function optionalCell(value: string | null | undefined) {
  return value ? (
    <span className="text-sm">{value}</span>
  ) : (
    <span className="text-sm text-muted-foreground">—</span>
  )
}

export function getLatexHarvestColumns({
  onEdit,
  onDelete,
}: LatexHarvestColumnHandlers = {}): ColumnDef<LatexHarvest>[] {
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
        exportValue: (h: LatexHarvest) => h.date.slice(0, 10),
      },
    },
    {
      id: "estate",
      accessorFn: (h) => h.estate?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Estate" />
      ),
      cell: ({ row }) => optionalCell(row.original.estate?.name),
      meta: {
        exportHeader: "Estate",
        exportValue: (h: LatexHarvest) => h.estate?.name ?? "",
      },
    },
    {
      accessorKey: "rainfall",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rainfall" />
      ),
      cell: ({ row }) => {
        const v = row.original.rainfall
        return v != null ? (
          <span className="text-sm">{Number(v).toFixed(2)}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )
      },
      meta: {
        exportHeader: "Rainfall",
        exportValue: (h: LatexHarvest) =>
          h.rainfall != null ? Number(h.rainfall).toFixed(2) : "",
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
        exportValue: (h: LatexHarvest) => h.remark ?? "",
      },
    },
    {
      id: "lines",
      accessorFn: (h) => lineCount(h),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lines" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{lineCount(row.original)}</span>
      ),
      enableSorting: false,
      meta: {
        exportHeader: "Lines",
        exportValue: (h: LatexHarvest) => String(lineCount(h)),
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
