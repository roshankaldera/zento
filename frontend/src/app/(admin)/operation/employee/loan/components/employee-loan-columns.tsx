"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader, DataTableRowActions } from "@/components/data-table"
import type { EmployeeLoan } from "@/types/employee-loan"
import { formatMoney, statusLabel, statusVariant } from "./employee-loan-schema"

export interface EmployeeLoanColumnHandlers {
  onEdit?: (loan: EmployeeLoan) => void
  onDelete?: (loan: EmployeeLoan) => void
}

export function getEmployeeLoanColumns({
  onEdit,
  onDelete,
}: EmployeeLoanColumnHandlers = {}): ColumnDef<EmployeeLoan>[] {
  return [
    {
      id: "employee",
      accessorFn: (l) => l.employee?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Employee" />
      ),
      cell: ({ row }) =>
        row.original.employee?.name ? (
          <span className="font-medium text-foreground">
            {row.original.employee.name}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
      meta: {
        exportHeader: "Employee",
        exportValue: (l: EmployeeLoan) => l.employee?.name ?? "",
      },
    },
    {
      accessorKey: "issueDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Issue Date" />
      ),
      cell: ({ row }) => {
        const v = row.getValue<string | null>("issueDate")
        return v ? (
          <span className="text-sm">{v.slice(0, 10)}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )
      },
      meta: {
        exportHeader: "Issue Date",
        exportValue: (l: EmployeeLoan) => l.issueDate?.slice(0, 10) ?? "",
      },
    },
    {
      accessorKey: "value",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Loan Amount" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{formatMoney(row.getValue("value"))}</span>
      ),
      meta: {
        exportHeader: "Loan Amount",
        exportValue: (l: EmployeeLoan) => formatMoney(l.value),
      },
    },
    {
      accessorKey: "installment",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Installment" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {formatMoney(row.getValue("installment"))}
        </span>
      ),
      meta: {
        exportHeader: "Installment",
        exportValue: (l: EmployeeLoan) => formatMoney(l.installment),
      },
    },
    {
      accessorKey: "dueDay",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due Day" />
      ),
      cell: ({ row }) => <span className="text-sm">{row.getValue("dueDay")}</span>,
      meta: { exportHeader: "Due Day" },
    },
    {
      accessorKey: "balance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Balance" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{formatMoney(row.getValue("balance"))}</span>
      ),
      meta: {
        exportHeader: "Balance",
        exportValue: (l: EmployeeLoan) => formatMoney(l.balance),
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue<number>("status")
        return <Badge variant={statusVariant(status)}>{statusLabel(status)}</Badge>
      },
      meta: {
        exportHeader: "Status",
        exportValue: (l: EmployeeLoan) => statusLabel(l.status),
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
