"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader, DataTableRowActions } from "@/components/data-table"
import type { KotIngredient } from "@/types/kot-ingredient"

export interface KotIngredientColumnHandlers {
  onEdit?: (row: KotIngredient) => void
  onDelete?: (row: KotIngredient) => void
}

function lineCount(row: KotIngredient): number {
  return row._count?.lines ?? row.lines?.length ?? 0
}

export function getKotIngredientColumns({
  onEdit,
  onDelete,
}: KotIngredientColumnHandlers = {}): ColumnDef<KotIngredient>[] {
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
        exportValue: (k: KotIngredient) => k.date.slice(0, 10),
      },
    },
    {
      id: "kots",
      accessorFn: (k) => k.kotIds.join(", "),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="KOTs" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.kotIds.join(", ")}</span>
      ),
      enableSorting: false,
      meta: {
        exportHeader: "KOTs",
        exportValue: (k: KotIngredient) => k.kotIds.join(", "),
      },
    },
    {
      accessorKey: "remark",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) =>
        row.original.remark ? (
          <span className="text-sm">{row.original.remark}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
      enableSorting: false,
      meta: {
        exportHeader: "Description",
        exportValue: (k: KotIngredient) => k.remark ?? "",
      },
    },
    {
      id: "lines",
      accessorFn: (k) => lineCount(k),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lines" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{lineCount(row.original)}</span>
      ),
      enableSorting: false,
      meta: {
        exportHeader: "Lines",
        exportValue: (k: KotIngredient) => String(lineCount(k)),
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
