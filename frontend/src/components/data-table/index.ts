/**
 * ERP DataTable framework — a reusable, strongly-typed table built on
 * TanStack Table v8 + shadcn/ui. Import everything from this barrel:
 *
 *   import { ERPDataTable, DataTableColumnHeader, DataTableRowActions }
 *     from "@/components/data-table"
 *
 * See ./README.md for architecture and usage.
 */

// All-in-one component (the common case)
export { ERPDataTable } from "./erp-data-table"

// Composable building blocks (for bespoke layouts)
export { DataTableToolbar } from "./data-table-toolbar"
export { DataTablePagination } from "./data-table-pagination"
export { DataTableColumnHeader } from "./data-table-column-header"
export { DataTableRowActions } from "./data-table-row-actions"
export { DataTableViewOptions } from "./data-table-view-options"
export {
  DataTableLoading,
  DataTableEmpty,
  DataTableError,
} from "./data-table-loading"
export { createSelectionColumn } from "./data-table-selection-column"

// Headless controller
export { useDataTable } from "./hooks/use-data-table"
export type { UseDataTableReturn } from "./hooks/use-data-table"

// Export utilities
export {
  exportToCsv,
  exportToExcel,
  type ExportScope,
  type ExportOptions,
} from "./data-table-export"

// Types
export type {
  ERPDataTableProps,
  UseDataTableOptions,
  ServerSideOptions,
  RowAction,
  DataTableSlotProps,
  ColumnDef,
  SortingState,
  PaginationState,
  ColumnFiltersState,
  RowSelectionState,
  VisibilityState,
  Table,
} from "./types"
