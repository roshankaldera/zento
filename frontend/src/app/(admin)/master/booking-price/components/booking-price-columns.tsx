"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader, DataTableRowActions } from "@/components/data-table"
import type { BookingPriceList } from "@/types/booking-price"

export interface BookingPriceColumnHandlers {
  onEdit?: (bookingPrice: BookingPriceList) => void
  onDelete?: (bookingPrice: BookingPriceList) => void
}

function lineCount(bookingPrice: BookingPriceList): number {
  return bookingPrice._count?.lines ?? bookingPrice.lines?.length ?? 0
}

/** Date-only ISO -> yyyy-mm-dd for display/export. */
const day = (iso: string): string => iso.slice(0, 10)

export function getBookingPriceColumns({
  onEdit,
  onDelete,
}: BookingPriceColumnHandlers = {}): ColumnDef<BookingPriceList>[] {
  return [
    {
      id: "business",
      accessorFn: (b) => b.business?.name ?? "—",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Business" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.business?.name ?? "—"}
        </span>
      ),
      meta: {
        exportHeader: "Business",
        exportValue: (b: BookingPriceList) => b.business?.name ?? "",
      },
    },
    {
      accessorKey: "fromDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="From Date" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{day(row.original.fromDate)}</span>
      ),
      meta: {
        exportHeader: "From Date",
        exportValue: (b: BookingPriceList) => day(b.fromDate),
      },
    },
    {
      accessorKey: "toDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="To Date" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{day(row.original.toDate)}</span>
      ),
      meta: {
        exportHeader: "To Date",
        exportValue: (b: BookingPriceList) => day(b.toDate),
      },
    },
    {
      id: "lines",
      accessorFn: (b) => lineCount(b),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rooms" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{lineCount(row.original)}</span>
      ),
      enableSorting: false,
      meta: {
        exportHeader: "Rooms",
        exportValue: (b: BookingPriceList) => String(lineCount(b)),
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
        exportValue: (b: BookingPriceList) => b.remark ?? "",
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
