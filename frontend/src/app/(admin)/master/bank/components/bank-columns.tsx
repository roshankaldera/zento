"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/data-table"
import { DataTableRowActions } from "@/components/data-table"
import type { Bank } from "@/types/bank"
import { bankTypeLabel } from "./bank-schema"

export interface BankColumnHandlers {
  onEdit?: (bank: Bank) => void
  onDelete?: (bank: Bank) => void
}

/** Render an optional string cell with an em-dash fallback. */
function optionalCell(value: string | null | undefined) {
  return value ? (
    <span className="text-sm">{value}</span>
  ) : (
    <span className="text-sm text-muted-foreground">—</span>
  )
}

/** Format a decimal string/number to 2 dp. */
const money = (v: string | number) => Number(v ?? 0).toFixed(2)

/**
 * Column factory for the Bank list. Handlers are injected by the screen so the
 * column array can be memoised with a stable identity.
 */
export function getBankColumns({
  onEdit,
  onDelete,
}: BankColumnHandlers = {}): ColumnDef<Bank>[] {
  return [
    {
      id: "business",
      accessorFn: (b) => b.business?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Business" />
      ),
      cell: ({ row }) => optionalCell(row.original.business?.name),
      meta: {
        exportHeader: "Business",
        exportValue: (b) => b.business?.name ?? "",
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">
          {bankTypeLabel(row.getValue<number>("type"))}
        </Badge>
      ),
      meta: {
        exportHeader: "Type",
        exportValue: (b) => bankTypeLabel(b.type),
      },
    },
    {
      accessorKey: "bank",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Bank / Person" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.getValue("bank")}
        </span>
      ),
      meta: { exportHeader: "Bank / Person" },
    },
    {
      accessorKey: "branch",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Branch" />
      ),
      cell: ({ row }) => optionalCell(row.getValue<string | null>("branch")),
      enableSorting: false,
      meta: { exportHeader: "Branch" },
    },
    {
      accessorKey: "accountNo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account No" />
      ),
      cell: ({ row }) => optionalCell(row.getValue<string | null>("accountNo")),
      enableSorting: false,
      meta: { exportHeader: "Account No" },
    },
    {
      accessorKey: "cashFloat",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cash Float" />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {money(row.getValue<string>("cashFloat"))}
        </span>
      ),
      meta: {
        exportHeader: "Cash Float",
        exportValue: (b) => money(b.cashFloat),
      },
    },
    {
      accessorKey: "balance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Balance" />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium tabular-nums">
          {money(row.getValue<string>("balance"))}
        </span>
      ),
      meta: {
        exportHeader: "Balance",
        exportValue: (b) => money(b.balance),
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
        exportValue: (b) => (b.status === 1 ? "Active" : "Inactive"),
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
