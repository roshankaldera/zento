import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { Metadata } from "next"
import React from "react"

import { listBudgets } from "@/lib/budget-service"
import type { Budget } from "@/types/budget"
import { BudgetListScreen } from "./components/budget-list"

export const metadata: Metadata = {
  title: "Budget | Zento",
  description: "Zento yearly budgets per business",
}

export default async function FinancialBudgetPage() {
  let initialBudgets: Budget[] = []
  let error: string | null = null
  try {
    initialBudgets = await listBudgets()
  } catch {
    error = "Failed to load budgets."
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Budget" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <BudgetListScreen initialBudgets={initialBudgets} error={error} />
      </div>
    </div>
  )
}
