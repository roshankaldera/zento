"use client"

import * as React from "react"
import type { Table } from "@tanstack/react-table"
import {
  DownloadIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableViewOptions } from "./data-table-view-options"
import {
  exportToCsv,
  exportToExcel,
  type ExportScope,
} from "./data-table-export"

interface DataTableToolbarProps<TData> {
  table: Table<TData>

  searchable?: boolean
  searchPlaceholder?: string
  /** Current global filter value (from useDataTable). */
  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void
  /** Debounce in ms for the search box. Defaults to 300. */
  searchDebounce?: number

  onAdd?: () => void
  addLabel?: string
  onRefresh?: () => void
  refreshing?: boolean

  exportExcel?: boolean
  exportCsv?: boolean
  exportFileName?: string
  selectable?: boolean

  /** Extra controls rendered between search and the action buttons. */
  children?: React.ReactNode
}

/**
 * Top bar for the DataTable: debounced global search, optional custom filters
 * (via `children`), column visibility, export menu, refresh and add.
 */
function DataTableToolbarInner<TData>({
  table,
  searchable = true,
  searchPlaceholder = "Search...",
  globalFilter = "",
  onGlobalFilterChange,
  searchDebounce = 300,
  onAdd,
  addLabel = "Add",
  onRefresh,
  refreshing = false,
  exportExcel = false,
  exportCsv = false,
  exportFileName = "export",
  selectable = false,
  children,
}: DataTableToolbarProps<TData>) {
  // Local mirror of the search value for instant typing; pushed to the table
  // (or server) after `searchDebounce` ms so we don't filter/refetch per key.
  const [search, setSearch] = React.useState(globalFilter)
  // Adjust local state during render when the controlled value changes
  // externally (e.g. a parent reset) — the React-recommended alternative to a
  // sync effect. See https://react.dev/learn/you-might-not-need-an-effect
  const [prevGlobalFilter, setPrevGlobalFilter] = React.useState(globalFilter)
  if (globalFilter !== prevGlobalFilter) {
    setPrevGlobalFilter(globalFilter)
    setSearch(globalFilter)
  }

  React.useEffect(() => {
    if (search === globalFilter) return
    const id = setTimeout(() => onGlobalFilterChange?.(search), searchDebounce)
    return () => clearTimeout(id)
  }, [search, globalFilter, onGlobalFilterChange, searchDebounce])

  const isFiltered =
    table.getState().columnFilters.length > 0 || globalFilter.length > 0

  const selectedCount = table.getSelectedRowModel().rows.length
  const hasSelection = selectable && selectedCount > 0
  const showExport = exportExcel || exportCsv

  const handleExport = React.useCallback(
    (kind: "excel" | "csv", scope: ExportScope) => {
      const fn = kind === "excel" ? exportToExcel : exportToCsv
      fn(table, { fileName: exportFileName, scope })
    },
    [table, exportFileName]
  )

  const clearFilters = React.useCallback(() => {
    table.resetColumnFilters()
    setSearch("")
    onGlobalFilterChange?.("")
  }, [table, onGlobalFilterChange])

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {searchable && (
          <div className="relative w-full sm:max-w-xs">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-8"
              aria-label="Search table"
            />
          </div>
        )}

        {children}

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="px-2"
          >
            Clear
            <XIcon />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DataTableViewOptions table={table} />

        {onRefresh && (
          <Button
            variant="outline"
            size="icon-sm"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh"
          >
            <RefreshCwIcon className={cn(refreshing && "animate-spin")} />
          </Button>
        )}

        {showExport && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <DownloadIcon />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                {hasSelection
                  ? `Export ${selectedCount} selected`
                  : "Export all rows"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {exportExcel && (
                <DropdownMenuItem
                  onClick={() =>
                    handleExport("excel", hasSelection ? "selected" : "all")
                  }
                >
                  <FileSpreadsheetIcon />
                  Excel (.xls)
                </DropdownMenuItem>
              )}
              {exportCsv && (
                <DropdownMenuItem
                  onClick={() =>
                    handleExport("csv", hasSelection ? "selected" : "all")
                  }
                >
                  <FileTextIcon />
                  CSV (.csv)
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {onAdd && (
          <Button size="sm" onClick={onAdd}>
            <PlusIcon />
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

export const DataTableToolbar = React.memo(
  DataTableToolbarInner
) as typeof DataTableToolbarInner
