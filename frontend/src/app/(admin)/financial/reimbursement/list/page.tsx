import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { Metadata } from "next"
import React from "react"

import { listReimbursements } from "@/lib/reimbursement-service"
import type { Reimbursement } from "@/types/reimbursement"
import { ReimbursementListScreen } from "../components/reimbursement-list"

export const metadata: Metadata = {
  title: "Reimbursement | Zento",
  description: "Zento reimbursement claims",
}

export default async function FinancialReimbursementListPage() {
  let initialReimbursements: Reimbursement[] = []
  let error: string | null = null
  try {
    initialReimbursements = await listReimbursements()
  } catch {
    error = "Failed to load reimbursements."
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Reimbursement" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <ReimbursementListScreen
          initialReimbursements={initialReimbursements}
          error={error}
        />
      </div>
    </div>
  )
}
