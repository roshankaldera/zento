# ERP DataTable (`@/components/data-table`)

A reusable, strongly-typed data-table framework for Zento, built on
**[TanStack Table v8](https://tanstack.com/table)** + **shadcn/ui**. Designed so
that 100+ master and transaction list screens (Customers, Suppliers, Items,
Purchase Orders, Invoices, Journal Entries, …) are a few dozen lines each — the
only thing that differs per screen is the **column definitions**.

```tsx
import { ERPDataTable } from "@/components/data-table"

<ERPDataTable
  title="Customers"
  columns={columns}
  data={customers}
  loading={loading}
  searchable
  selectable
  pagination
  exportExcel
  exportCsv
  onAdd={handleCreate}
  onRefresh={loadCustomers}
/>
```

## Folder structure

```
src/components/data-table/
├── erp-data-table.tsx            # all-in-one component (the common case)
├── data-table-toolbar.tsx        # search + add + refresh + export + clear
├── data-table-view-options.tsx   # column-visibility menu
├── data-table-pagination.tsx     # page size + first/prev/next/last + counts
├── data-table-column-header.tsx  # sortable / hideable header cell
├── data-table-row-actions.tsx    # ⋯ menu: View / Edit / Delete + custom
├── data-table-selection-column.tsx # leading checkbox column factory
├── data-table-export.ts          # exportToCsv / exportToExcel (no deps)
├── data-table-loading.tsx        # skeleton, empty & error states
├── hooks/
│   └── use-data-table.ts         # headless controller (state + table instance)
├── types.ts                      # shared TypeScript contracts
├── index.ts                      # barrel — import everything from here
└── examples/                     # reference screens (see below)
    ├── data.ts                   # mock domain types + data
    ├── customer-columns.tsx      # column-def factory + status badge + actions
    ├── customer-list.tsx         # client-side list screen
    ├── supplier-list.tsx         # second entity (reuse) + custom row actions
    └── server-side-customer-list.tsx # server pagination/sort/search
```

> This framework depends on four shadcn primitives that were added alongside it:
> `ui/table`, `ui/dropdown-menu`, `ui/alert-dialog`, `ui/skeleton`. They use the
> project's unified `radix-ui` package, matching the existing primitives.

## Architecture

```
                 useDataTable(options)          ← headless: owns state OR
                       │                            delegates to `serverSide`
                       ▼
                 TanStack `Table` instance
                       │
   ┌───────────────────┼─────────────────────────┐
   ▼                   ▼                           ▼
DataTableToolbar   <table> body              DataTablePagination
(search/export/   (flexRender headers/cells, (page size + nav + counts)
 add/refresh/      loading/empty/error)
 columns)
                       ▲
        column.header → DataTableColumnHeader (sort/hide)
        column.cell   → DataTableRowActions  (view/edit/delete/custom)
```

- **`useDataTable` is the keystone.** It builds the TanStack table, owns all
  client-side state (sorting, filters, visibility, selection, pagination), and —
  when you pass `serverSide` — flips `manual*` on and delegates that state to the
  parent. `ERPDataTable` is just presentation over this hook, so you can also
  compose the pieces yourself for bespoke layouts.
- **Columns are data, not markup.** Each screen exports a `getXColumns(handlers)`
  factory returning `ColumnDef<T>[]`. Headers use `DataTableColumnHeader`; the
  actions column uses `DataTableRowActions`. This is the single thing that varies
  per screen.

## Client-side vs. server-side

The same component and columns work both ways — switching is **purely additive**.

| Concern     | Client-side (default)        | Server-side (pass `serverSide`)         |
| ----------- | ---------------------------- | --------------------------------------- |
| Pagination  | `getPaginationRowModel`      | `manualPagination` + your `pageCount`   |
| Sorting     | `getSortedRowModel`          | `manualSorting` + `onSortingChange`     |
| Filtering   | `getFilteredRowModel`        | `manualFiltering` + `onGlobalFilterChange` |
| Best for    | ≤ a few thousand rows        | large / transactional datasets          |

```tsx
<ERPDataTable
  columns={columns}
  data={data}
  loading={loading}
  error={error}
  serverSide={{
    pageCount, rowCount,
    pagination, onPaginationChange: setPagination,
    sorting,    onSortingChange:    setSorting,
    globalFilter: search, onGlobalFilterChange: setSearch,
  }}
/>
```

See [`examples/server-side-customer-list.tsx`](./examples/server-side-customer-list.tsx)
for the full fetch-on-change wiring. The search box is **debounced** (300 ms) so
server mode doesn't refetch on every keystroke.

## Building a column file

```tsx
import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader, DataTableRowActions } from "@/components/data-table"

export function getCustomerColumns(handlers): ColumnDef<Customer>[] {
  return [
    {
      accessorKey: "customerName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      meta: { exportHeader: "Customer Name" },   // friendly export label
    },
    {
      accessorKey: "balance",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Balance" />,
      cell: ({ row }) => formatCurrency(row.getValue("balance")),
      meta: { exportValue: (c) => c.balance },    // export the raw number
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <DataTableRowActions row={row} onView={...} onEdit={...} onDelete={...} />
      ),
    },
  ]
}
```

### Column `meta` hooks (export & visibility)

`types.ts` augments TanStack's `ColumnMeta`:

| meta key            | effect                                                        |
| ------------------- | ------------------------------------------------------------ |
| `exportHeader`      | header label used in CSV/Excel + the column-toggle menu      |
| `exportValue`       | `(row) => unknown` custom serializer (e.g. raw number, ISO date) |
| `excludeFromExport` | omit the column from CSV/Excel                               |

## Export

`exportToCsv` and `exportToExcel` are **dependency-free**:

- **CSV** — RFC-4180 quoting, UTF-8 BOM so Excel reads accents correctly.
- **Excel** — a SpreadsheetML (`.xls`) workbook that Excel/LibreOffice/Sheets
  open natively. No `xlsx`/`exceljs` dependency. Swap the function body for one
  of those libs later (multi-sheet, styling) **without changing any call site**.

Both honour **column visibility** and a **scope**: `all` (every filtered row,
across pages), `selected` (checked rows), or `page`. The toolbar auto-picks
`selected` when there is a selection, else `all`.

## Performance

- **Stable column identity.** Define columns with `useMemo` (or a module-level
  factory) — TanStack rebuilds header/cell internals when the array identity
  changes. Every example does this.
- **`getRowId`.** Pass a stable id so row selection survives data refreshes and
  re-renders don't remount rows.
- **Memoised sub-components.** Toolbar, pagination, column header, row actions
  and view options are wrapped in `React.memo` (generic identity preserved).
- **Debounced search** avoids per-keystroke filtering/refetching.
- **Minimal row models.** The hook only attaches the client row models it needs;
  in server mode none of the client sort/filter/paginate workers run.
- **Field-scoped re-renders** stay within TanStack's state — typing in search
  doesn't re-render the whole page, only the table subtree.

## Accessibility

- Real semantic `<table>`/`<thead>`/`<tbody>` markup.
- Every icon-only control has an `aria-label` (sort, pagination nav, refresh,
  row actions, selection checkboxes).
- Sorting & column visibility live in keyboard-navigable Radix menus; delete is
  gated behind a focus-trapped Radix `AlertDialog`.
- Selection checkboxes expose proper `indeterminate` state for "some selected".

## Dark mode & responsive

- All styling flows through **shadcn semantic tokens** (`bg-card`, `text-muted-
  foreground`, `border`, `bg-destructive/10`, …) so `.dark` works for free.
  > Note: this uses the shadcn neutral palette, **not** the TailAdmin `brand-*`
  > palette — consistent with the rest of `src/components/ui`.
- The toolbar wraps on small screens; pagination collapses (first/last buttons
  and the "rows per page" label hide below `lg`); the table scrolls horizontally
  inside a rounded card.

## Best practices for ERP systems

1. **One column file per entity.** `get<Entity>Columns(handlers)` returning
   `ColumnDef<T>[]`. Keep it pure data; pass row callbacks in from the screen.
2. **Domain types end-to-end.** `ERPDataTable<Customer>` infers everything;
   never use `any` columns.
3. **Always pass `getRowId`.** Selection, optimistic delete and refresh depend
   on stable ids.
4. **Start client-side; graduate to server-side when data grows.** No refactor —
   add `serverSide` and move filtering/sorting to your API.
5. **Status as `Badge`, money right-aligned & `tabular-nums`, raw values via
   `meta.exportValue`.** Display formatting and export formatting are separate
   concerns.
6. **Confirm destructive actions.** `DataTableRowActions` confirms delete via
   `AlertDialog` by default (`confirmDelete={false}` to opt out).
7. **Forms pair with the RHF library.** Use
   [`@/components/hook-form`](../hook-form/README.md) for the create/edit screens
   these tables link to.

## Using the examples in a route

The example screens are client components; render them from a server-component
page (matching the existing `PageBreadcrumb` + card pattern):

```tsx
// app/(admin)/master/customer/page.tsx
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { CustomerListScreen } from "@/components/data-table/examples/customer-list"

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Customers" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <CustomerListScreen />
      </div>
    </div>
  )
}
```

## Dependencies

`@tanstack/react-table` (v8) + the shadcn primitives in `src/components/ui`
(`table`, `dropdown-menu`, `alert-dialog`, `skeleton`, `button`, `input`,
`select`, `badge`, `checkbox`, `separator`). Export uses **no extra libraries**.
