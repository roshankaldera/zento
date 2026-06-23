"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader, DataTableRowActions } from "@/components/data-table"
import type { ExchangeRate } from "@/types/exchange-rate"
import { currencyLabel, formatRate } from "./exchange-rate-schema"

export interface ExchangeRateColumnHandlers {
  onEdit?: (rate: ExchangeRate) => void
  onDelete?: (rate: ExchangeRate) => void
}

export function getExchangeRateColumns({
  onEdit,
  onDelete,
}: ExchangeRateColumnHandlers = {}): ColumnDef<ExchangeRate>[] {
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
        exportValue: (r: ExchangeRate) => r.date.slice(0, 10),
      },
    },
    {
      accessorKey: "currencyId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Currency" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">
          {currencyLabel(row.getValue<number>("currencyId"))}
        </Badge>
      ),
      meta: {
        exportHeader: "Currency",
        exportValue: (r: ExchangeRate) => currencyLabel(r.currencyId),
      },
    },
    {
      accessorKey: "rate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Day Rate" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{formatRate(row.getValue("rate"))}</span>
      ),
      meta: {
        exportHeader: "Day Rate",
        exportValue: (r: ExchangeRate) => formatRate(r.rate),
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
