import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { Metadata } from "next"
import React from "react"

import type { Option } from "@/components/hook-form"
import { listBusinesses } from "@/lib/business-service"
import { listEmployees } from "@/lib/employee-service"
import { listItemsWithStock } from "@/lib/item-transaction-service"
import { ItemTransactionForm } from "../components/item-transaction-form"
import { itemTransactionFormDefaults } from "../components/item-transaction-schema"

export const metadata: Metadata = {
  title: "New Item Transaction | Zento",
  description: "Add a new item transaction",
}

export default async function NewItemTransactionPage() {
  const [businesses, employees, items] = await Promise.all([
    listBusinesses().catch(() => []),
    listEmployees().catch(() => []),
    listItemsWithStock().catch(() => []),
  ])
  const businessOptions: Option[] = businesses.map((b) => ({
    label: b.name,
    value: String(b.id),
  }))
  const employeeOptions: Option[] = employees.map((e) => ({
    label: `${e.empNo} — ${e.name}`,
    value: String(e.id),
  }))

  return (
    <div>
      <PageBreadcrumb pageTitle="New Item Transaction" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <ItemTransactionForm
          mode="create"
          defaultValues={itemTransactionFormDefaults}
          businessOptions={businessOptions}
          employeeOptions={employeeOptions}
          items={items}
        />
      </div>
    </div>
  )
}
