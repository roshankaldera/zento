import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { Metadata } from "next"
import React from "react"

import type { Option } from "@/components/hook-form"
import { listBanks } from "@/lib/bank-service"
import { CashTransferForm } from "../components/cash-transfer-form"
import { cashTransferFormDefaults } from "../components/cash-transfer-schema"

export const metadata: Metadata = {
  title: "New Cash Transfer | Zento",
  description: "Add a new cash transfer",
}

export default async function NewCashTransferPage() {
  const banks = await listBanks().catch(() => [])
  const bankOptions: Option[] = banks.map((b) => ({
    label: b.branch ? `${b.bank} — ${b.branch}` : b.bank,
    value: String(b.id),
  }))

  return (
    <div>
      <PageBreadcrumb pageTitle="New Cash Transfer" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <CashTransferForm
          mode="create"
          defaultValues={cashTransferFormDefaults}
          bankOptions={bankOptions}
        />
      </div>
    </div>
  )
}
