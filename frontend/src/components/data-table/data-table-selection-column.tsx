"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Checkbox } from "@/components/ui/checkbox"

/**
 * Builds the leading row-selection column (select-all header + per-row check).
 * Kept out of {@link useDataTable} so its identity is trivially stable.
 */
export function createSelectionColumn<TData, TValue = unknown>(): ColumnDef<
  TData,
  TValue
> {
  return {
    id: "__select__",
    enableSorting: false,
    enableHiding: false,
    size: 36,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? "indeterminate"
              : false
        }
        onCheckedChange={(value) =>
          table.toggleAllPageRowsSelected(Boolean(value))
        }
        aria-label="Select all rows on this page"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        onClick={(e) => e.stopPropagation()}
        aria-label="Select row"
      />
    ),
  }
}
