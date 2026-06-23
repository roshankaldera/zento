"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { BanIcon, FileText } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ERPDataTable } from "../erp-data-table"
import { DataTableColumnHeader } from "../data-table-column-header"
import { DataTableRowActions } from "../data-table-row-actions"
import { type Supplier, MOCK_SUPPLIERS, formatCurrency } from "./data"

/**
 * Second example to prove reuse: a different entity, a custom row action
 * ("Statement") and a destructive custom action ("Block"), with no changes to
 * the framework — only the columns differ.
 */
export function SupplierListScreen() {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>(MOCK_SUPPLIERS)

  const columns = React.useMemo<ColumnDef<Supplier>[]>(
    () => [
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
      },
      {
        accessorKey: "supplierName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Supplier" />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue("supplierName")}</span>
        ),
        meta: { exportHeader: "Supplier Name" },
      },
      {
        accessorKey: "contactPerson",
        header: "Contact",
        enableSorting: false,
      },
      {
        accessorKey: "category",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Category" />
        ),
      },
      {
        accessorKey: "payable",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Payable"
            className="justify-end"
          />
        ),
        cell: ({ row }) => (
          <div className="text-right font-medium tabular-nums">
            {formatCurrency(row.getValue<number>("payable"))}
          </div>
        ),
        meta: { exportHeader: "Payable", exportValue: (s) => s.payable },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.getValue<Supplier["status"]>("status")
          return (
            <Badge
              variant={status === "active" ? "default" : "secondary"}
              className="capitalize"
            >
              {status}
            </Badge>
          )
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DataTableRowActions
              row={row}
              onEdit={(s) => console.log("edit", s.id)}
              onDelete={(s) =>
                setSuppliers((prev) => prev.filter((x) => x.id !== s.id))
              }
              actions={[
                {
                  label: "Statement",
                  icon: FileText,
                  onClick: (s) => console.log("statement", s.id),
                },
                {
                  label: "Block",
                  icon: BanIcon,
                  destructive: true,
                  hidden: (s) => s.status === "inactive",
                  onClick: (s) => console.log("block", s.id),
                },
              ]}
            />
          </div>
        ),
      },
    ],
    []
  )

  return (
    <ERPDataTable
      title="Suppliers"
      columns={columns}
      data={suppliers}
      getRowId={(s) => s.id}
      searchable
      selectable
      pagination
      exportCsv
      exportFileName="suppliers"
      searchPlaceholder="Search suppliers..."
      onAdd={() => console.log("add supplier")}
    />
  )
}
