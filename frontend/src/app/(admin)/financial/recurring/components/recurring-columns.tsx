"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import {
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/data-table"
import type { Recurring } from "@/types/recurring"
import { statusLabel } from "./recurring-schema"

export interface RecurringColumnHandlers {
  onEdit?: (row: Recurring) => void
  onDelete?: (row: Recurring) => void
}

function lineCount(row: Recurring): number {
  return row._count?.lines ?? row.lines?.length ?? 0
}

function optionalCell(value: string | null | undefined) {
  return value ? (
    <span className="text-sm">{value}</span>
  ) : (
    <span className="text-sm text-muted-foreground">—</span>
  )
}

function period(row: Recurring): string {
  const from = row.fromPeriod ? row.fromPeriod.slice(0, 10) : "—"
  const to = row.toPeriod ? row.toPeriod.slice(0, 10) : "—"
  return `${from} → ${to}`
}

export function getRecurringColumns({
  onEdit,
  onDelete,
}: RecurringColumnHandlers = {}): ColumnDef<Recurring>[] {
  return [
    {
      id: "business",
      accessorFn: (r) => r.business?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Business" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.business?.name ?? "—"}
        </span>
      ),
      meta: {
        exportHeader: "Business",
        exportValue: (r: Recurring) => r.business?.name ?? "",
      },
    },
    {
      id: "category",
      accessorFn: (r) => r.journalCategory?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => optionalCell(row.original.journalCategory?.name),
      enableSorting: false,
      meta: {
        exportHeader: "Category",
        exportValue: (r: Recurring) => r.journalCategory?.name ?? "",
      },
    },
    {
      accessorKey: "recurringDay",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Day" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue<number>("recurringDay")}</span>
      ),
      meta: {
        exportHeader: "Recurring Day",
        exportValue: (r: Recurring) => String(r.recurringDay),
      },
    },
    {
      id: "period",
      accessorFn: (r) => period(r),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Period" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{period(row.original)}</span>
      ),
      enableSorting: false,
      meta: {
        exportHeader: "Period",
        exportValue: (r: Recurring) => period(r),
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
        exportValue: (r: Recurring) => String(lineCount(r)),
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
            {statusLabel(row.getValue<number>("status"))}
          </Badge>
        )
      },
      meta: {
        exportHeader: "Status",
        exportValue: (r: Recurring) => statusLabel(r.status),
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
