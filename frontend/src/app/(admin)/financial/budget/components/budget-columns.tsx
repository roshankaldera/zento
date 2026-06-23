"use client"

import type { ColumnDef } from "@tanstack/react-table"

import {
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/data-table"
import type { Budget } from "@/types/budget"

export interface BudgetColumnHandlers {
  onEdit?: (row: Budget) => void
  onDelete?: (row: Budget) => void
}

function lineCount(row: Budget): number {
  return row._count?.lines ?? row.lines?.length ?? 0
}

function optionalCell(value: string | null | undefined) {
  return value ? (
    <span className="text-sm">{value}</span>
  ) : (
    <span className="text-sm text-muted-foreground">—</span>
  )
}

export function getBudgetColumns({
  onEdit,
  onDelete,
}: BudgetColumnHandlers = {}): ColumnDef<Budget>[] {
  return [
    {
      accessorKey: "year",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Year" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.getValue<number>("year")}
        </span>
      ),
      meta: {
        exportHeader: "Year",
        exportValue: (b: Budget) => String(b.year),
      },
    },
    {
      id: "business",
      accessorFn: (b) => b.business?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Business" />
      ),
      cell: ({ row }) => optionalCell(row.original.business?.name),
      meta: {
        exportHeader: "Business",
        exportValue: (b: Budget) => b.business?.name ?? "",
      },
    },
    {
      id: "lines",
      accessorFn: (b) => lineCount(b),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lines" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{lineCount(row.original)}</span>
      ),
      enableSorting: false,
      meta: {
        exportHeader: "Lines",
        exportValue: (b: Budget) => String(lineCount(b)),
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
