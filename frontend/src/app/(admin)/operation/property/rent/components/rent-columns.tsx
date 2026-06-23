"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader, DataTableRowActions } from "@/components/data-table"
import type { Rent } from "@/types/rent"
import { formatMoney, statusLabel, statusVariant } from "./rent-schema"

export interface RentColumnHandlers {
  onEdit?: (rent: Rent) => void
  onDelete?: (rent: Rent) => void
}

function optionalCell(value: string | null | undefined) {
  return value ? (
    <span className="text-sm">{value}</span>
  ) : (
    <span className="text-sm text-muted-foreground">—</span>
  )
}

export function getRentColumns({
  onEdit,
  onDelete,
}: RentColumnHandlers = {}): ColumnDef<Rent>[] {
  return [
    {
      accessorKey: "tenant",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tenant" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.getValue("tenant")}
        </span>
      ),
      meta: { exportHeader: "Tenant" },
    },
    {
      id: "business",
      accessorFn: (r) => r.business?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Business" />
      ),
      cell: ({ row }) => optionalCell(row.original.business?.name),
      meta: {
        exportHeader: "Business",
        exportValue: (r: Rent) => r.business?.name ?? "",
      },
    },
    {
      id: "asset",
      accessorFn: (r) => r.asset?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Asset" />
      ),
      cell: ({ row }) => optionalCell(row.original.asset?.name),
      meta: {
        exportHeader: "Asset",
        exportValue: (r: Rent) => r.asset?.name ?? "",
      },
    },
    {
      accessorKey: "rentValue",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rent Value" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{formatMoney(row.getValue("rentValue"))}</span>
      ),
      meta: {
        exportHeader: "Rent Value",
        exportValue: (r: Rent) => formatMoney(r.rentValue),
      },
    },
    {
      accessorKey: "paymentDay",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Pay Day" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("paymentDay")}</span>
      ),
      meta: { exportHeader: "Pay Day" },
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="End Date" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.getValue<string>("endDate").slice(0, 10)}
        </span>
      ),
      meta: {
        exportHeader: "End Date",
        exportValue: (r: Rent) => r.endDate.slice(0, 10),
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
        exportValue: (r: Rent) => statusLabel(r.status),
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
