import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { Metadata } from "next"
import React from "react"

import { listRecurrings } from "@/lib/recurring-service"
import type { Recurring } from "@/types/recurring"
import { RecurringListScreen } from "../components/recurring-list"

export const metadata: Metadata = {
  title: "Recurring | Zento",
  description: "Zento recurring journal templates",
}

export default async function FinancialRecurringListPage() {
  let initialRecurrings: Recurring[] = []
  let error: string | null = null
  try {
    initialRecurrings = await listRecurrings()
  } catch {
    error = "Failed to load recurrings."
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Recurring" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <RecurringListScreen initialRecurrings={initialRecurrings} error={error} />
      </div>
    </div>
  )
}
