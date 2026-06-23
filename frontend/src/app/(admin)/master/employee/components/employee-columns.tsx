"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/data-table"
import { DataTableRowActions } from "@/components/data-table"
import type { Employee } from "@/types/employee"
import { attendTypeLabel } from "./employee-schema"

export interface EmployeeColumnHandlers {
  onEdit?: (employee: Employee) => void
  onDelete?: (employee: Employee) => void
}

/** Render an optional string cell with an em-dash fallback. */
function optionalCell(value: string | null | undefined) {
  return value ? (
    <span className="text-sm">{value}</span>
  ) : (
    <span className="text-sm text-muted-foreground">—</span>
  )
}

/**
 * Column factory for the Employee list. Handlers are injected by the screen so
 * the column array can be memoised with a stable identity.
 */
export function getEmployeeColumns({
  onEdit,
  onDelete,
}: EmployeeColumnHandlers = {}): ColumnDef<Employee>[] {
  return [
    {
      accessorKey: "empNo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Emp No" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.getValue("empNo")}
        </span>
      ),
      meta: { exportHeader: "Emp No" },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("name")}</span>
      ),
      meta: { exportHeader: "Name" },
    },
    {
      id: "business",
      accessorFn: (e) => e.business?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Business" />
      ),
      cell: ({ row }) => optionalCell(row.original.business?.name),
      meta: {
        exportHeader: "Business",
        exportValue: (e) => e.business?.name ?? "",
      },
    },
    {
      accessorKey: "nic",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="NIC" />
      ),
      cell: ({ row }) => <span className="text-sm">{row.getValue("nic")}</span>,
      meta: { exportHeader: "NIC" },
    },
    {
      accessorKey: "mobile1",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mobile" />
      ),
      cell: ({ row }) => optionalCell(row.getValue<string | null>("mobile1")),
      enableSorting: false,
      meta: { exportHeader: "Mobile" },
    },
    {
      accessorKey: "dob",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DOB" />
      ),
      // Show the date-only portion to keep it timezone-stable.
      cell: ({ row }) =>
        optionalCell(row.getValue<string | null>("dob")?.slice(0, 10)),
      meta: {
        exportHeader: "DOB",
        exportValue: (e) => e.dob?.slice(0, 10) ?? "",
      },
    },
    {
      accessorKey: "attendType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Attendance" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">
          {attendTypeLabel(row.getValue<number>("attendType"))}
        </Badge>
      ),
      meta: {
        exportHeader: "Attendance",
        exportValue: (e) => attendTypeLabel(e.attendType),
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
            {active ? "Active" : "Inactive"}
          </Badge>
        )
      },
      meta: {
        exportHeader: "Status",
        exportValue: (e) => (e.status === 1 ? "Active" : "Inactive"),
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
