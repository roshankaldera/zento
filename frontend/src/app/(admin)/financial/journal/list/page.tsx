import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { Metadata } from "next"
import React from "react"

import { listJournals } from "@/lib/journal-service"
import type { Journal } from "@/types/journal"
import { JournalListScreen } from "../components/journal-list"

export const metadata: Metadata = {
  title: "Journal | Zento",
  description: "Zento journal vouchers",
}

export default async function FinancialJournalListPage() {
  let initialJournals: Journal[] = []
  let error: string | null = null
  try {
    initialJournals = await listJournals()
  } catch {
    error = "Failed to load journals."
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Journal" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <JournalListScreen initialJournals={initialJournals} error={error} />
      </div>
    </div>
  )
}
