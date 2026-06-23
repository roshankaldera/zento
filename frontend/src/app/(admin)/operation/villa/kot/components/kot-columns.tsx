"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader, DataTableRowActions } from "@/components/data-table"
import type { Kot } from "@/types/kot"

export interface KotColumnHandlers {
  onEdit?: (kot: Kot) => void
  onDelete?: (kot: Kot) => void
}

function lineCount(kot: Kot): number {
  return kot._count?.lines ?? kot.lines?.length ?? 0
}

function optionalCell(value: string | null | undefined) {
  return value ? (
    <span className="text-sm">{value}</span>
  ) : (
    <span className="text-sm text-muted-foreground">—</span>
  )
}

export function getKotColumns({
  onEdit,
  onDelete,
}: KotColumnHandlers = {}): ColumnDef<Kot>[] {
  return [
    {
      accessorKey: "requestTime",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Request Time" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.getValue<string>("requestTime").slice(0, 10)}
        </span>
      ),
      meta: {
        exportHeader: "Request Time",
        exportValue: (k: Kot) => k.requestTime.slice(0, 10),
      },
    },
    {
      id: "business",
      accessorFn: (k) => k.business?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Business" />
      ),
      cell: ({ row }) => optionalCell(row.original.business?.name),
      meta: {
        exportHeader: "Business",
        exportValue: (k: Kot) => k.business?.name ?? "",
      },
    },
    {
      id: "booking",
      accessorFn: (k) => k.booking?.customer ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Booking" />
      ),
      cell: ({ row }) => optionalCell(row.original.booking?.customer),
      meta: {
        exportHeader: "Booking",
        exportValue: (k: Kot) => k.booking?.customer ?? "",
      },
    },
    {
      accessorKey: "remark",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => optionalCell(row.original.remark),
      enableSorting: false,
      meta: {
        exportHeader: "Description",
        exportValue: (k: Kot) => k.remark ?? "",
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
        exportValue: (k: Kot) => String(lineCount(k)),
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
