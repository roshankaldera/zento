import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { Metadata } from "next"
import React from "react"

import { listCashTransfers } from "@/lib/cash-transfer-service"
import type { CashTransfer } from "@/types/cash-transfer"
import { CashTransferListScreen } from "../components/cash-transfer-list"

export const metadata: Metadata = {
  title: "Cash Transfer | Zento",
  description: "Zento cash transfers between banks",
}

export default async function FinancialCashTransferListPage() {
  let initialCashTransfers: CashTransfer[] = []
  let error: string | null = null
  try {
    initialCashTransfers = await listCashTransfers()
  } catch {
    error = "Failed to load cash transfers."
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Cash Transfer" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <CashTransferListScreen
          initialCashTransfers={initialCashTransfers}
          error={error}
        />
      </div>
    </div>
  )
}
