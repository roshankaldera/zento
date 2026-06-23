import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { Metadata } from "next"
import React from "react"

import { RecurringForm } from "./components/recurring-form"
import { recurringFormDefaults } from "./components/recurring-schema"
import { loadRecurringOptions } from "./components/recurring-options"

export const metadata: Metadata = {
  title: "New Recurring | Zento",
  description: "Add a new recurring template",
}

export default async function FinancialRecurringPage() {
  const options = await loadRecurringOptions()

  return (
    <div>
      <PageBreadcrumb pageTitle="New Recurring" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <RecurringForm
          mode="create"
          defaultValues={recurringFormDefaults}
          {...options}
        />
      </div>
    </div>
  )
}
