"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import {
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/data-table"
import type { CashTransfer, CashTransferBankRef } from "@/types/cash-transfer"
import { formatMoney, statusLabel, statusVariant } from "./cash-transfer-schema"

export interface CashTransferColumnHandlers {
  onEdit?: (row: CashTransfer) => void
  onDelete?: (row: CashTransfer) => void
}

function bankLabel(ref: CashTransferBankRef | undefined): string {
  if (!ref) return ""
  return ref.branch ? `${ref.bank} — ${ref.branch}` : ref.bank
}

function optionalCell(value: string | null | undefined) {
  return value ? (
    <span className="text-sm">{value}</span>
  ) : (
    <span className="text-sm text-muted-foreground">—</span>
  )
}

export function getCashTransferColumns({
  onEdit,
  onDelete,
}: CashTransferColumnHandlers = {}): ColumnDef<CashTransfer>[] {
  return [
    {
      accessorKey: "cashTransfer",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cash Transfer No" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.cashTransfer ?? "—"}
        </span>
      ),
      meta: {
        exportHeader: "Cash Transfer No",
        exportValue: (r: CashTransfer) => r.cashTransfer ?? "",
      },
    },
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
        exportValue: (r: CashTransfer) => r.date.slice(0, 10),
      },
    },
    {
      id: "fromBank",
      accessorFn: (r) => bankLabel(r.fromBankRef),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="From Bank" />
      ),
      cell: ({ row }) => optionalCell(bankLabel(row.original.fromBankRef)),
      meta: {
        exportHeader: "From Bank",
        exportValue: (r: CashTransfer) => bankLabel(r.fromBankRef),
      },
    },
    {
      id: "toBank",
      accessorFn: (r) => bankLabel(r.toBankRef),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="To Bank" />
      ),
      cell: ({ row }) => optionalCell(bankLabel(row.original.toBankRef)),
      meta: {
        exportHeader: "To Bank",
        exportValue: (r: CashTransfer) => bankLabel(r.toBankRef),
      },
    },
    {
      accessorKey: "value",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Value" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{formatMoney(row.getValue("value"))}</span>
      ),
      meta: {
        exportHeader: "Value",
        exportValue: (r: CashTransfer) => formatMoney(r.value),
      },
    },
    {
      accessorKey: "reference",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reference" />
      ),
      cell: ({ row }) => optionalCell(row.original.reference),
      enableSorting: false,
      meta: {
        exportHeader: "Reference",
        exportValue: (r: CashTransfer) => r.reference ?? "",
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue<number>("status")
        return (
          <Badge variant={statusVariant(status)}>{statusLabel(status)}</Badge>
        )
      },
      meta: {
        exportHeader: "Status",
        exportValue: (r: CashTransfer) => statusLabel(r.status),
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
