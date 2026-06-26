"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader, DataTableRowActions } from "@/components/data-table"
import type { Asset } from "@/types/asset"
import { assetTypeLabel } from "./asset-schema"

export interface AssetColumnHandlers {
  businessNameById?: Record<number, string>
  onEdit?: (asset: Asset) => void
  onDelete?: (asset: Asset) => void
}

export function getAssetColumns({
  businessNameById = {},
  onEdit,
  onDelete,
}: AssetColumnHandlers = {}): ColumnDef<Asset>[] {
  const businessName = (asset: Asset) =>
    businessNameById[asset.businessId] ?? "—"

  return [
    {
      id: "business",
      accessorFn: (asset) => businessName(asset),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Business" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{businessName(row.original)}</span>
      ),
      meta: {
        exportHeader: "Business",
        exportValue: (a: Asset) => businessName(a),
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.getValue("name")}
        </span>
      ),
      meta: { exportHeader: "Name" },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">
          {assetTypeLabel(row.getValue<number>("type"))}
        </Badge>
      ),
      meta: {
        exportHeader: "Type",
        exportValue: (a: Asset) => assetTypeLabel(a.type),
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
        exportValue: (a: Asset) => (a.status === 1 ? "Active" : "Inactive"),
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
        exportValue: (a: Asset) => a.remark ?? "",
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
