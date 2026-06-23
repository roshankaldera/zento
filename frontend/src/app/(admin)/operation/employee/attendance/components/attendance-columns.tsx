"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader, DataTableRowActions } from "@/components/data-table"
import type { Attendance } from "@/types/attendance"

export interface AttendanceColumnHandlers {
  onEdit?: (attendance: Attendance) => void
  onDelete?: (attendance: Attendance) => void
}

function lineCount(attendance: Attendance): number {
  return attendance._count?.lines ?? attendance.lines?.length ?? 0
}

export function getAttendanceColumns({
  onEdit,
  onDelete,
}: AttendanceColumnHandlers = {}): ColumnDef<Attendance>[] {
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
        exportValue: (a: Attendance) => a.date.slice(0, 10),
      },
    },
    {
      id: "business",
      accessorFn: (a) => a.business?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Business" />
      ),
      cell: ({ row }) =>
        row.original.business?.name ? (
          <span className="text-sm">{row.original.business.name}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
      meta: {
        exportHeader: "Business",
        exportValue: (a: Attendance) => a.business?.name ?? "",
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
        exportValue: (a: Attendance) => a.remark ?? "",
      },
    },
    {
      id: "lines",
      accessorFn: (a) => lineCount(a),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lines" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{lineCount(row.original)}</span>
      ),
      enableSorting: false,
      meta: {
        exportHeader: "Lines",
        exportValue: (a: Attendance) => String(lineCount(a)),
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
