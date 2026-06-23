"use client"

import * as React from "react"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type Table,
  type VisibilityState,
} from "@tanstack/react-table"

import type { UseDataTableOptions } from "../types"
import { createSelectionColumn } from "../data-table-selection-column"

export interface UseDataTableReturn<TData> {
  table: Table<TData>
  /** Current global search value (client mode) or the server-controlled one. */
  globalFilter: string
  setGlobalFilter: (value: string) => void
}

/**
 * Headless controller for the ERP DataTable. Owns table state (or delegates it
 * to `serverSide`) and returns a memoised TanStack `Table` instance.
 *
 * Client-side by default; pass `serverSide` to drive pagination / sorting /
 * filtering from your data source without any other change to call sites.
 */
export function useDataTable<TData, TValue = unknown>({
  data,
  columns,
  selectable = false,
  pagination = true,
  pageSize = 10,
  getRowId,
  serverSide,
}: UseDataTableOptions<TData, TValue>): UseDataTableReturn<TData> {
  const isServer = Boolean(serverSide)

  // --- Internal (client-side) state. Ignored when `serverSide` is provided. ---
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [clientGlobalFilter, setClientGlobalFilter] = React.useState("")
  const [clientPagination, setClientPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  })

  // Prepend a stable selection column when requested. Memoised so the column
  // identity is stable across renders (prevents TanStack header churn).
  const resolvedColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    if (!selectable) return columns
    return [createSelectionColumn<TData, TValue>(), ...columns]
  }, [columns, selectable])

  const globalFilter = isServer
    ? (serverSide?.globalFilter ?? "")
    : clientGlobalFilter

  const setGlobalFilter = React.useCallback(
    (value: string) => {
      if (isServer) serverSide?.onGlobalFilterChange?.(value)
      else setClientGlobalFilter(value)
    },
    [isServer, serverSide]
  )

  // TanStack Table returns un-memoizable functions, so the React Compiler skips
  // it; this is expected and safe — the table manages its own internal state.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<TData>({
    data,
    columns: resolvedColumns,
    getRowId,

    state: {
      sorting: isServer ? serverSide?.sorting : sorting,
      columnFilters: isServer ? serverSide?.columnFilters : columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination: isServer ? serverSide!.pagination : clientPagination,
    },

    // Selection
    enableRowSelection: selectable,
    onRowSelectionChange: setRowSelection,

    // Visibility (always client-side — it's a view concern)
    onColumnVisibilityChange: setColumnVisibility,

    // Sorting
    onSortingChange: isServer ? serverSide?.onSortingChange : setSorting,
    manualSorting: isServer,

    // Filtering
    onColumnFiltersChange: isServer
      ? serverSide?.onColumnFiltersChange
      : setColumnFilters,
    onGlobalFilterChange: isServer ? undefined : setClientGlobalFilter,
    manualFiltering: isServer,

    // Pagination
    onPaginationChange: isServer
      ? serverSide!.onPaginationChange
      : setClientPagination,
    manualPagination: isServer,
    pageCount: isServer ? serverSide!.pageCount : undefined,
    rowCount: isServer ? serverSide?.rowCount : undefined,

    // Row models — only attach the client-side workers we actually use.
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: isServer ? undefined : getSortedRowModel(),
    getFilteredRowModel: isServer ? undefined : getFilteredRowModel(),
    getPaginationRowModel:
      isServer || !pagination ? undefined : getPaginationRowModel(),

    autoResetPageIndex: !isServer,
  })

  return { table, globalFilter, setGlobalFilter }
}
