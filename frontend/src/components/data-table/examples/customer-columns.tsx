"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "../data-table-column-header"
import { DataTableRowActions } from "../data-table-row-actions"
import { type Customer, formatCurrency, formatDate } from "./data"

/**
 * Column handlers are passed in from the screen so the column definitions stay
 * pure data and can be memoised once. A factory keeps the columns reusable.
 */
export interface CustomerColumnHandlers {
  onView?: (customer: Customer) => void
  onEdit?: (customer: Customer) => void
  onDelete?: (customer: Customer) => void
}

const STATUS_VARIANT: Record<
  Customer["status"],
  "default" | "secondary" | "destructive"
> = {
  active: "default",
  inactive: "secondary",
  blocked: "destructive",
}

export function getCustomerColumns({
  onView,
  onEdit,
  onDelete,
}: CustomerColumnHandlers = {}): ColumnDef<Customer>[] {
  return [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.getValue("code")}
        </span>
      ),
      meta: { exportHeader: "Code" },
    },
    {
      accessorKey: "customerName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {row.getValue("customerName")}
          </span>
          <span className="text-xs text-muted-foreground">
            {row.original.email}
          </span>
        </div>
      ),
      meta: { exportHeader: "Customer Name" },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <span className="text-sm">{row.getValue("phone")}</span>,
      enableSorting: false,
    },
    {
      accessorKey: "city",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="City" />
      ),
    },
    {
      accessorKey: "balance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Balance" className="justify-end" />
      ),
      cell: ({ row }) => {
        const balance = row.getValue<number>("balance")
        return (
          <div
            className={cn(
              "text-right font-medium tabular-nums",
              balance < 0 && "text-destructive"
            )}
          >
            {formatCurrency(balance)}
          </div>
        )
      },
      meta: {
        exportHeader: "Balance",
        exportValue: (c) => c.balance,
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue<Customer["status"]>("status")
        return (
          <Badge variant={STATUS_VARIANT[status]} className="capitalize">
            {status}
          </Badge>
        )
      },
      // Enables faceted/exact filtering on the status column server- or client-side.
      filterFn: (row, id, value: string[]) =>
        value.includes(row.getValue(id)),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.getValue("createdAt"))}
        </span>
      ),
      meta: {
        exportHeader: "Created",
        exportValue: (c) => formatDate(c.createdAt),
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DataTableRowActions
            row={row}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ),
    },
  ]
}
