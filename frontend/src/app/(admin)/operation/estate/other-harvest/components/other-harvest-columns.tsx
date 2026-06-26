"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader, DataTableRowActions } from "@/components/data-table"
import type { OtherHarvest } from "@/types/other-harvest"
import { formatNumber } from "./other-harvest-schema"

export interface OtherHarvestColumnHandlers {
  onEdit?: (otherHarvest: OtherHarvest) => void
  onDelete?: (otherHarvest: OtherHarvest) => void
}

export function getOtherHarvestColumns({
  onEdit,
  onDelete,
}: OtherHarvestColumnHandlers = {}): ColumnDef<OtherHarvest>[] {
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
        exportValue: (h: OtherHarvest) => h.date.slice(0, 10),
      },
    },
    {
      id: "estate",
      accessorFn: (h) => h.estate?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Estate" />
      ),
      cell: ({ row }) =>
        row.original.estate?.name ? (
          <span className="text-sm">{row.original.estate.name}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
      meta: {
        exportHeader: "Estate",
        exportValue: (h: OtherHarvest) => h.estate?.name ?? "",
      },
    },
    {
      id: "supplier",
      accessorFn: (h) => h.supplier?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Supplier" />
      ),
      cell: ({ row }) =>
        row.original.supplier?.name ? (
          <span className="text-sm">{row.original.supplier.name}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
      meta: {
        exportHeader: "Supplier",
        exportValue: (h: OtherHarvest) => h.supplier?.name ?? "",
      },
    },
    {
      id: "crop",
      accessorFn: (h) => h.crop?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Crop" />
      ),
      cell: ({ row }) =>
        row.original.crop?.name ? (
          <span className="text-sm">{row.original.crop.name}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
      meta: {
        exportHeader: "Crop",
        exportValue: (h: OtherHarvest) => h.crop?.name ?? "",
      },
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Quantity" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {formatNumber(row.getValue<number>("quantity"))}
        </span>
      ),
      meta: {
        exportHeader: "Quantity",
        exportValue: (h: OtherHarvest) => formatNumber(h.quantity),
      },
    },
    {
      accessorKey: "value",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Value" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {formatNumber(row.getValue<number>("value"))}
        </span>
      ),
      meta: {
        exportHeader: "Value",
        exportValue: (h: OtherHarvest) => formatNumber(h.value),
      },
    },
    {
      accessorKey: "reference",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reference" />
      ),
      cell: ({ row }) =>
        row.original.reference ? (
          <span className="text-sm">{row.original.reference}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
      enableSorting: false,
      meta: {
        exportHeader: "Reference",
        exportValue: (h: OtherHarvest) => h.reference ?? "",
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
