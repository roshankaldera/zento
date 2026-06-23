import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { Metadata } from "next"
import React from "react"

import { listItemTransactions } from "@/lib/item-transaction-service"
import type { ItemTransaction } from "@/types/item-transaction"
import { ItemTransactionListScreen } from "./components/item-transaction-list"

export const metadata: Metadata = {
  title: "Item Transaction | Zento",
  description: "Zento inventory item transactions",
}

export default async function OperationInventoryItemTransactionPage() {
  let initialItemTransactions: ItemTransaction[] = []
  let error: string | null = null
  try {
    initialItemTransactions = await listItemTransactions()
  } catch {
    error = "Failed to load item transactions."
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Item Transaction" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <ItemTransactionListScreen
          initialItemTransactions={initialItemTransactions}
          error={error}
        />
      </div>
    </div>
  )
}
