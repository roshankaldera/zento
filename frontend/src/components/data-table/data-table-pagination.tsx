"use client"

import * as React from "react"
import type { Table } from "@tanstack/react-table"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pageSizeOptions?: number[]
  /** Whether any rows are selectable (shows the "N selected" caption). */
  selectable?: boolean
}

/** Page-size selector, record/selection counts, and first/prev/next/last nav. */
function DataTablePaginationInner<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 50, 100],
  selectable = false,
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = table.getPageCount()
  const totalRows = table.getRowCount()
  const selectedCount = table.getSelectedRowModel().rows.length

  const firstRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const lastRow = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-3 px-1 sm:flex-row">
      <div className="text-sm text-muted-foreground">
        {selectable && selectedCount > 0 ? (
          <span>
            {selectedCount} of {totalRows} row(s) selected.
          </span>
        ) : (
          <span>
            {firstRow}–{lastRow} of {totalRows} record
            {totalRows === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <p className="hidden text-sm font-medium sm:block">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger size="sm" className="h-8 w-[4.5rem]">
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center text-sm font-medium whitespace-nowrap">
          Page {pageCount === 0 ? 0 : pageIndex + 1} of {pageCount}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            className="hidden lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Go to first page"
          >
            <ChevronsLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Go to previous page"
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Go to next page"
          >
            <ChevronRightIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="hidden lg:flex"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Go to last page"
          >
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}

export const DataTablePagination = React.memo(
  DataTablePaginationInner
) as typeof DataTablePaginationInner
