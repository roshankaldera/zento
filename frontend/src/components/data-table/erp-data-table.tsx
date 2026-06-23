"use client"

import * as React from "react"
import { flexRender, type Table as TanstackTable } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ERPDataTableProps } from "./types"
import { useDataTable } from "./hooks/use-data-table"
import { DataTableToolbar } from "./data-table-toolbar"
import { DataTablePagination } from "./data-table-pagination"
import {
  DataTableEmpty,
  DataTableError,
  DataTableLoading,
} from "./data-table-loading"

/**
 * The all-in-one ERP data table. Wraps {@link useDataTable} (state) with the
 * toolbar, table body, and pagination. Drop it onto any list screen:
 *
 * ```tsx
 * <ERPDataTable title="Customers" columns={columns} data={customers}
 *   loading={loading} searchable selectable pagination exportExcel exportCsv
 *   onAdd={handleCreate} onRefresh={loadCustomers} />
 * ```
 *
 * Switch to server-side by passing `serverSide` — no other change required.
 */
function ERPDataTableInner<TData, TValue = unknown>({
  title,
  description,
  columns,
  data,
  loading = false,
  error = null,
  searchable = true,
  selectable = false,
  pagination = true,
  exportExcel = false,
  exportCsv = false,
  exportFileName,
  pageSize = 10,
  pageSizeOptions,
  getRowId,
  serverSide,
  onAdd,
  addLabel,
  onRefresh,
  onRowClick,
  searchPlaceholder,
  emptyMessage,
  toolbarActions,
  className,
}: ERPDataTableProps<TData, TValue>) {
  const { table, globalFilter, setGlobalFilter } = useDataTable<TData, TValue>({
    data,
    columns,
    selectable,
    pagination,
    pageSize,
    getRowId,
    serverSide,
  })

  const columnCount = table.getAllLeafColumns().length
  const rows = table.getRowModel().rows

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      {(title || description) && (
        <div className="space-y-0.5">
          {title && (
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <DataTableToolbar
        table={table}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        onAdd={onAdd}
        addLabel={addLabel}
        onRefresh={onRefresh}
        refreshing={loading}
        exportExcel={exportExcel}
        exportCsv={exportCsv}
        exportFileName={exportFileName ?? title ?? "export"}
        selectable={selectable}
      >
        {toolbarActions}
      </DataTableToolbar>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={
                      header.getSize() !== 150
                        ? { width: header.getSize() }
                        : undefined
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <DataTableLoading rows={pageSize} columns={columnCount} />
            ) : error ? (
              <DataTableError columns={columnCount} message={error} />
            ) : rows.length === 0 ? (
              <DataTableEmpty columns={columnCount} message={emptyMessage} />
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && !loading && !error && rows.length > 0 && (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          selectable={selectable}
        />
      )}
    </div>
  )
}

// Cast preserves the generic signature through React.memo.
export const ERPDataTable = React.memo(ERPDataTableInner) as typeof ERPDataTableInner

export type { TanstackTable }
