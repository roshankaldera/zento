"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader, DataTableRowActions } from "@/components/data-table"
import type { Booking } from "@/types/booking"
import {
  categoryLabel,
  currencyLabel,
  formatMoney,
  statusLabel,
  statusVariant,
} from "./booking-schema"

export interface BookingColumnHandlers {
  onEdit?: (booking: Booking) => void
  onDelete?: (booking: Booking) => void
}

export function getBookingColumns({
  onEdit,
  onDelete,
}: BookingColumnHandlers = {}): ColumnDef<Booking>[] {
  return [
        {
      accessorKey: "bookingNo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Booking No" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.getValue("bookingNo")}
        </span>
      ),
      meta: {
        exportHeader: "Booking No",
        exportValue: (b: Booking) => b.bookingNo,
      },
    },
    {
      accessorKey: "customer",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.getValue("customer")}
        </span>
      ),
      meta: { exportHeader: "Customer" },
    },
    {
      id: "business",
      accessorFn: (b) => b.business?.name ?? "",
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
        exportValue: (b: Booking) => b.business?.name ?? "",
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">
          {categoryLabel(row.getValue<number>("category"))}
        </Badge>
      ),
      meta: {
        exportHeader: "Category",
        exportValue: (b: Booking) => categoryLabel(b.category),
      },
    },
    {
      accessorKey: "fromDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="From" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.getValue<string>("fromDate").slice(0, 10)}
        </span>
      ),
      meta: {
        exportHeader: "From",
        exportValue: (b: Booking) => b.fromDate.slice(0, 10),
      },
    },
    {
      accessorKey: "toDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="To" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.getValue<string>("toDate").slice(0, 10)}
        </span>
      ),
      meta: {
        exportHeader: "To",
        exportValue: (b: Booking) => b.toDate.slice(0, 10),
      },
    },
    {
      accessorKey: "pax",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PAX" />
      ),
      cell: ({ row }) => <span className="text-sm">{row.getValue("pax")}</span>,
      meta: { exportHeader: "PAX" },
    },
    {
      accessorKey: "currency",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Currency" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {currencyLabel(row.getValue<number>("currency"))}
        </span>
      ),
      meta: {
        exportHeader: "Currency",
        exportValue: (b: Booking) => currencyLabel(b.currency),
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
        exportValue: (b: Booking) => statusLabel(b.status),
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
