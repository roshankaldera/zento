"use client"

import * as React from "react"
import type {
  OnChangeFn,
  PaginationState,
  SortingState,
} from "@tanstack/react-table"

import { ERPDataTable } from "../erp-data-table"
import { getCustomerColumns } from "./customer-columns"
import { type Customer, MOCK_CUSTOMERS } from "./data"

/**
 * Shape your list endpoint is expected to return. Swap the `fakeFetch` body for
 * a real `fetch`/RPC call — the wiring around it does not change.
 */
interface PagedResult {
  rows: Customer[]
  pageCount: number
  total: number
}

/** Simulates a server that paginates, sorts and searches. */
async function fakeFetch(params: {
  pageIndex: number
  pageSize: number
  sorting: SortingState
  search: string
}): Promise<PagedResult> {
  await new Promise((r) => setTimeout(r, 400))

  let rows = [...MOCK_CUSTOMERS]
  const q = params.search.trim().toLowerCase()
  if (q) {
    rows = rows.filter(
      (c) =>
        c.customerName.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    )
  }

  const sort = params.sorting[0]
  if (sort) {
    rows.sort((a, b) => {
      const av = a[sort.id as keyof Customer]
      const bv = b[sort.id as keyof Customer]
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sort.desc ? -cmp : cmp
    })
  }

  const total = rows.length
  const start = params.pageIndex * params.pageSize
  return {
    rows: rows.slice(start, start + params.pageSize),
    pageCount: Math.max(1, Math.ceil(total / params.pageSize)),
    total,
  }
}

/**
 * Server-side ERP list. The parent owns pagination / sorting / search state and
 * refetches whenever any of it changes; the table only emits the changes.
 *
 * Note the SAME `ERPDataTable` and `getCustomerColumns` are reused — going from
 * client- to server-side is purely additive (the `serverSide` prop).
 */
export function ServerSideCustomerListScreen() {
  const [data, setData] = React.useState<Customer[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [pageCount, setPageCount] = React.useState(0)
  const [rowCount, setRowCount] = React.useState(0)
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [search, setSearch] = React.useState("")

  // Changing the result set (sort / search) must reset to the first page. Do it
  // in the change handlers rather than an effect to avoid a double fetch.
  const handleSortingChange = React.useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      setSorting(updater)
      setPagination((p) => ({ ...p, pageIndex: 0 }))
    },
    []
  )

  const handleSearchChange = React.useCallback((value: string) => {
    setSearch(value)
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [])

  // Canonical fetch-on-change effect: synchronise the table with the server
  // whenever pagination / sorting / search change. In production prefer a data
  // layer like TanStack Query, which removes this effect (and its lint caveat)
  // entirely.
  React.useEffect(() => {
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect -- entering loading state before an async fetch
    setLoading(true)
    setError(null)
    fakeFetch({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting,
      search,
    })
      .then((res) => {
        if (!active) return
        setData(res.rows)
        setPageCount(res.pageCount)
        setRowCount(res.total)
      })
      .catch((e) => active && setError(e?.message ?? "Failed to load"))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [pagination, sorting, search])

  const columns = React.useMemo(
    () =>
      getCustomerColumns({
        onView: (c) => console.log("view", c.id),
        onEdit: (c) => console.log("edit", c.id),
        onDelete: (c) => console.log("delete", c.id),
      }),
    []
  )

  return (
    <ERPDataTable
      title="Customers (server-side)"
      description="Pagination, sorting and search are resolved on the server."
      columns={columns}
      data={data}
      loading={loading}
      error={error}
      getRowId={(c) => c.id}
      searchable
      selectable
      pagination
      exportCsv
      searchPlaceholder="Search customers..."
      onRefresh={() => setPagination((p) => ({ ...p }))}
      serverSide={{
        pageCount,
        rowCount,
        pagination,
        onPaginationChange: setPagination,
        sorting,
        onSortingChange: handleSortingChange,
        globalFilter: search,
        onGlobalFilterChange: handleSearchChange,
      }}
    />
  )
}
