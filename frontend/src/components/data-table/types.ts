import type * as React from "react"
import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  RowSelectionState,
  SortingState,
  Table,
  VisibilityState,
} from "@tanstack/react-table"

/**
 * Controlled server-side state. Provide this object to switch the table from
 * client-side (the default) into "manual" mode where pagination / sorting /
 * filtering are driven by your data source (REST, RPC, etc).
 *
 * When present, the table sets `manualPagination`, `manualSorting` and
 * `manualFiltering` to `true` and stops doing the work itself — it only emits
 * state changes through the `on*Change` callbacks so you can refetch.
 */
export interface ServerSideOptions {
  /** Total number of pages on the server (required for manual pagination). */
  pageCount: number
  /** Total number of rows on the server (for the "N of M" pagination label). */
  rowCount?: number

  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>

  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>

  /** Debounced global search term, controlled by the parent. */
  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void

  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
}

/**
 * A single custom entry rendered inside the row-actions dropdown, below the
 * built-in View / Edit / Delete items.
 */
export interface RowAction<TData> {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: (row: TData) => void
  /** Render with destructive styling and (optionally) a confirmation dialog. */
  destructive?: boolean
  /** Hide the item for specific rows (e.g. based on status). */
  hidden?: (row: TData) => boolean
  disabled?: (row: TData) => boolean
}

/**
 * Options accepted by {@link useDataTable}. This is the headless layer — it
 * builds and returns a TanStack `Table` instance; rendering is done by the
 * presentational components (`ERPDataTable` and friends).
 */
export interface UseDataTableOptions<TData, TValue = unknown> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]

  /** Enable the row-selection checkbox column + selection state. */
  selectable?: boolean
  /** Enable client-side pagination state (ignored when `serverSide` is set). */
  pagination?: boolean
  /** Initial page size. Defaults to 10. */
  pageSize?: number

  /** Stable unique row id accessor. Strongly recommended for selection. */
  getRowId?: (row: TData, index: number) => string

  /** Switches the table into server-driven mode. See {@link ServerSideOptions}. */
  serverSide?: ServerSideOptions
}

/**
 * Props for the all-in-one `ERPDataTable`. This is the component 95% of ERP
 * list screens render directly.
 */
export interface ERPDataTableProps<TData, TValue = unknown> {
  /** Heading rendered above the toolbar. */
  title?: string
  /** Optional sub-heading / count caption rendered under the title. */
  description?: string

  columns: ColumnDef<TData, TValue>[]
  data: TData[]

  loading?: boolean
  /** Error message; when set, the table body shows an error state. */
  error?: string | null

  searchable?: boolean
  selectable?: boolean
  pagination?: boolean

  exportExcel?: boolean
  exportCsv?: boolean
  /** Base filename (without extension) for exported files. Defaults to title. */
  exportFileName?: string

  /** Initial page size. Defaults to 10. */
  pageSize?: number
  pageSizeOptions?: number[]

  /** Stable unique row id accessor. */
  getRowId?: (row: TData, index: number) => string

  /** Server-side mode. When provided, `pageCount` is read from here. */
  serverSide?: ServerSideOptions
  /** Convenience prop mirrored to TanStack when using `serverSide`. */
  pageCount?: number

  onAdd?: () => void
  addLabel?: string
  onRefresh?: () => void
  onRowClick?: (row: TData) => void

  searchPlaceholder?: string
  /** Empty-state message when there is no data. */
  emptyMessage?: string

  /** Extra nodes rendered in the toolbar (e.g. faceted filters). */
  toolbarActions?: React.ReactNode

  className?: string
}

/** Shared prop carrying a TanStack table instance to a sub-component. */
export interface DataTableSlotProps<TData> {
  table: Table<TData>
}

export type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Table,
  VisibilityState,
}
