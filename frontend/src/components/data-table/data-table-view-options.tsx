"use client"

import * as React from "react"
import type { Table } from "@tanstack/react-table"
import { Settings2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

/** Column-visibility toggle menu ("Columns ▾"). */
function DataTableViewOptionsInner<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const hideableColumns = table
    .getAllColumns()
    .filter((c) => typeof c.accessorFn !== "undefined" && c.getCanHide())

  if (hideableColumns.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hidden lg:flex">
          <Settings2Icon />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideableColumns.map((column) => {
          const label =
            (column.columnDef.meta?.exportHeader as string | undefined) ??
            column.id
              .replace(/([a-z])([A-Z])/g, "$1 $2")
              .replace(/[_-]+/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {label}
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const DataTableViewOptions = React.memo(
  DataTableViewOptionsInner
) as typeof DataTableViewOptionsInner
