"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader, DataTableRowActions } from "@/components/data-table"
import type { Leave } from "@/types/leave"
import { periodLabel } from "./leave-schema"

export interface LeaveColumnHandlers {
  onEdit?: (leave: Leave) => void
  onDelete?: (leave: Leave) => void
}

export function getLeaveColumns({
  onEdit,
  onDelete,
}: LeaveColumnHandlers = {}): ColumnDef<Leave>[] {
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
        exportValue: (l: Leave) => l.date.slice(0, 10),
      },
    },
    {
      id: "employee",
      accessorFn: (l) => l.employee?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Employee" />
      ),
      cell: ({ row }) =>
        row.original.employee?.name ? (
          <span className="text-sm">{row.original.employee.name}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
      meta: {
        exportHeader: "Employee",
        exportValue: (l: Leave) => l.employee?.name ?? "",
      },
    },
    {
      accessorKey: "period",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Period" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">
          {periodLabel(row.getValue<number>("period"))}
        </Badge>
      ),
      meta: {
        exportHeader: "Period",
        exportValue: (l: Leave) => periodLabel(l.period),
      },
    },
    {
      accessorKey: "reason",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reason" />
      ),
      cell: ({ row }) =>
        row.original.reason ? (
          <span className="text-sm">{row.original.reason}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
      enableSorting: false,
      meta: {
        exportHeader: "Reason",
        exportValue: (l: Leave) => l.reason ?? "",
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
