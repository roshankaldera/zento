"use client"

import * as React from "react"

import { ERPDataTable } from "../erp-data-table"
import { getCustomerColumns } from "./customer-columns"
import { type Customer, MOCK_CUSTOMERS } from "./data"

/**
 * Canonical client-side ERP list screen. Everything (search, sort, paginate,
 * export, select) happens in the browser — ideal for small/medium master data.
 *
 * Drop this into a route, e.g. `app/(admin)/master/customer/page.tsx`.
 */
export function CustomerListScreen() {
  const [customers, setCustomers] = React.useState<Customer[]>(MOCK_CUSTOMERS)
  const [loading, setLoading] = React.useState(false)

  const loadCustomers = React.useCallback(async () => {
    setLoading(true)
    // Replace with your API client, e.g. `await api.customers.list()`.
    await new Promise((r) => setTimeout(r, 600))
    setCustomers(MOCK_CUSTOMERS)
    setLoading(false)
  }, [])

  const handleCreate = React.useCallback(() => {
    // e.g. router.push("/master/customer/new") or open a drawer.
    console.log("create customer")
  }, [])

  // Memoise the columns so their identity is stable across renders.
  const columns = React.useMemo(
    () =>
      getCustomerColumns({
        onView: (c) => console.log("view", c.id),
        onEdit: (c) => console.log("edit", c.id),
        onDelete: (c) =>
          setCustomers((prev) => prev.filter((x) => x.id !== c.id)),
      }),
    []
  )

  return (
    <ERPDataTable
      title="Customers"
      description="Manage your customer master records."
      columns={columns}
      data={customers}
      loading={loading}
      getRowId={(c) => c.id}
      searchable
      selectable
      pagination
      exportExcel
      exportCsv
      exportFileName="customers"
      searchPlaceholder="Search customers..."
      onAdd={handleCreate}
      onRefresh={loadCustomers}
      onRowClick={(c) => console.log("row click", c.id)}
    />
  )
}
