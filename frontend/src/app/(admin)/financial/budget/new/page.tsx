import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { Metadata } from "next"
import React from "react"

import type { Option } from "@/components/hook-form"
import { listAccounts } from "@/lib/account-service"
import { listBusinesses } from "@/lib/business-service"
import { BudgetForm, type BusinessScopedOption } from "../components/budget-form"
import { budgetFormDefaults } from "../components/budget-schema"

export const metadata: Metadata = {
  title: "New Budget | Zento",
  description: "Add a new budget",
}

export default async function NewBudgetPage() {
  const [businesses, accounts] = await Promise.all([
    listBusinesses().catch(() => []),
    listAccounts().catch(() => []),
  ])
  const businessOptions: Option[] = businesses.map((b) => ({
    label: b.name,
    value: String(b.id),
  }))
  const accountOptions: BusinessScopedOption[] = accounts.map((a) => ({
    label: `${a.code} — ${a.name}`,
    value: String(a.id),
    businessId: a.businessId,
  }))

  return (
    <div>
      <PageBreadcrumb pageTitle="New Budget" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <BudgetForm
          mode="create"
          defaultValues={budgetFormDefaults}
          businessOptions={businessOptions}
          accountOptions={accountOptions}
        />
      </div>
    </div>
  )
}
