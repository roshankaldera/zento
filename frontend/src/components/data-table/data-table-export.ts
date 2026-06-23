import type { Column, RowData, Row, Table } from "@tanstack/react-table"

/**
 * Per-column export hints. Augment TanStack's `ColumnMeta` so any column can
 * opt into a friendly header label or a custom cell serializer:
 *
 *   { accessorKey: "createdAt", meta: { exportHeader: "Created",
 *       exportValue: (row) => row.createdAt.toISOString() } }
 *
 * Columns with `meta.excludeFromExport` (and the built-in select/actions
 * columns) are skipped automatically.
 */
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    exportHeader?: string
    exportValue?: (row: TData) => unknown
    excludeFromExport?: boolean
  }
}

export type ExportScope = "all" | "selected" | "page"

export interface ExportOptions {
  /** File name without extension. */
  fileName: string
  /**
   * Which rows to export:
   *  - "all":      every filtered/sorted row across all pages (default)
   *  - "selected": only checked rows
   *  - "page":     only the current page's rows
   */
  scope?: ExportScope
}

const NON_EXPORTABLE_IDS = new Set(["__select__", "actions"])

function getExportableColumns<TData>(table: Table<TData>): Column<TData>[] {
  return table
    .getVisibleLeafColumns()
    .filter(
      (col) =>
        !NON_EXPORTABLE_IDS.has(col.id) &&
        !col.columnDef.meta?.excludeFromExport &&
        // Only columns that can actually resolve a value.
        (col.accessorFn !== undefined || col.columnDef.meta?.exportValue)
    )
}

function headerFor<TData>(col: Column<TData>): string {
  const header = col.columnDef.meta?.exportHeader
  if (header) return header
  const raw = col.columnDef.header
  if (typeof raw === "string" && raw.length > 0) return raw
  // Humanise the column id as a last resort: "customerName" -> "Customer Name".
  return col.id
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function valueFor<TData>(col: Column<TData>, row: Row<TData>): unknown {
  const custom = col.columnDef.meta?.exportValue
  if (custom) return custom(row.original)
  return row.getValue(col.id)
}

function rowsFor<TData>(table: Table<TData>, scope: ExportScope): Row<TData>[] {
  if (scope === "selected") return table.getSelectedRowModel().rows
  if (scope === "page") return table.getRowModel().rows
  // "all" = every row after filtering/sorting, across pages.
  return table.getSortedRowModel().rows
}

function serialize(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

/** Build a [headers, ...rows] matrix from the current table state. */
function buildMatrix<TData>(
  table: Table<TData>,
  scope: ExportScope
): { headers: string[]; rows: string[][] } {
  const columns = getExportableColumns(table)
  const headers = columns.map(headerFor)
  const rows = rowsFor(table, scope).map((row) =>
    columns.map((col) => serialize(valueFor(col, row)))
  )
  return { headers, rows }
}

function triggerDownload(blob: Blob, fileName: string): void {
  if (typeof window === "undefined") return
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const escapeCsv = (cell: string): string =>
  /[",\n\r]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell

/**
 * Export the table to a CSV file. Dependency-free. Honours column visibility
 * and the selected scope (all / selected / page).
 */
export function exportToCsv<TData>(
  table: Table<TData>,
  { fileName, scope = "all" }: ExportOptions
): void {
  const { headers, rows } = buildMatrix(table, scope)
  const lines = [headers, ...rows].map((cells) =>
    cells.map(escapeCsv).join(",")
  )
  // Prepend BOM so Excel reads UTF-8 correctly.
  const blob = new Blob(["﻿" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  })
  triggerDownload(blob, `${fileName}.csv`)
}

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")

/**
 * Export the table to an Excel-readable `.xls` file using SpreadsheetML.
 *
 * This is intentionally dependency-free — it produces a single-sheet XML
 * workbook that Excel, LibreOffice and Google Sheets all open natively. For
 * advanced needs (multiple sheets, styled cells, formulas) swap this body for
 * `xlsx`/`exceljs`; the call sites do not change.
 */
export function exportToExcel<TData>(
  table: Table<TData>,
  { fileName, scope = "all" }: ExportOptions
): void {
  const { headers, rows } = buildMatrix(table, scope)

  const cell = (text: string, isHeader = false) => {
    const type = !isHeader && /^-?\d+(\.\d+)?$/.test(text) ? "Number" : "String"
    return `<Cell><Data ss:Type="${type}">${escapeXml(text)}</Data></Cell>`
  }

  const headerRow = `<Row>${headers.map((h) => cell(h, true)).join("")}</Row>`
  const bodyRows = rows
    .map((r) => `<Row>${r.map((c) => cell(c)).join("")}</Row>`)
    .join("")

  const xml =
    '<?xml version="1.0"?>' +
    '<?mso-application progid="Excel.Sheet"?>' +
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ' +
    'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' +
    `<Worksheet ss:Name="${escapeXml(fileName).slice(0, 31)}">` +
    `<Table>${headerRow}${bodyRows}</Table>` +
    "</Worksheet></Workbook>"

  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" })
  triggerDownload(blob, `${fileName}.xls`)
}
