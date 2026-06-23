"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader, DataTableRowActions } from "@/components/data-table"
import type { Soloar } from "@/types/soloar"
import { formatReading } from "./soloar-schema"

export interface SoloarColumnHandlers {
  onEdit?: (soloar: Soloar) => void
  onDelete?: (soloar: Soloar) => void
}

export function getSoloarColumns({
  onEdit,
  onDelete,
}: SoloarColumnHandlers = {}): ColumnDef<Soloar>[] {
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
        exportValue: (s: Soloar) => s.date.slice(0, 10),
      },
    },
    {
      id: "soloar",
      accessorFn: (s) => s.asset?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Soloar" />
      ),
      cell: ({ row }) =>
        row.original.asset?.name ? (
          <span className="text-sm">{row.original.asset.name}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
      meta: {
        exportHeader: "Soloar",
        exportValue: (s: Soloar) => s.asset?.name ?? "",
      },
    },
    {
      accessorKey: "meterReading",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Meter Reading" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {formatReading(row.getValue("meterReading"))}
        </span>
      ),
      meta: {
        exportHeader: "Meter Reading",
        exportValue: (s: Soloar) => formatReading(s.meterReading),
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
