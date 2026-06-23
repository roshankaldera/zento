import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { Metadata } from "next"
import React from "react"

import { JournalForm } from "./components/journal-form"
import { journalFormDefaults } from "./components/journal-schema"
import { loadJournalOptions } from "./components/journal-options"

export const metadata: Metadata = {
  title: "New Journal | Zento",
  description: "Add a new journal voucher",
}

export default async function FinancialJournalPage() {
  const options = await loadJournalOptions()

  return (
    <div>
      <PageBreadcrumb pageTitle="New Journal" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <JournalForm
          mode="create"
          defaultValues={journalFormDefaults}
          {...options}
        />
      </div>
    </div>
  )
}
