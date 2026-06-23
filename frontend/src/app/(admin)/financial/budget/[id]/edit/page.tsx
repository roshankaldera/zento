import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { Metadata } from "next"
import Link from "next/link"
import React from "react"

import type { Option } from "@/components/hook-form"
import { Button } from "@/components/ui/button"
import { listAccounts } from "@/lib/account-service"
import { listBusinesses } from "@/lib/business-service"
import { getBudget } from "@/lib/budget-service"
import {
  BudgetForm,
  type BusinessScopedOption,
} from "../../components/budget-form"
import { toBudgetFormValues } from "../../components/budget-schema"
import { BUDGET_LIST_PATH } from "../../components/constants"

export const metadata: Metadata = {
  title: "Edit Budget | Zento",
  description: "Update an existing budget",
}

export default async function EditBudgetPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [budget, businesses, accounts] = await Promise.all([
    Number.isFinite(Number(id)) ? getBudget(Number(id)) : undefined,
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
      <PageBreadcrumb pageTitle="Edit Budget" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {budget ? (
          <BudgetForm
            mode="edit"
            budgetId={budget.id}
            defaultValues={toBudgetFormValues(budget)}
            businessOptions={businessOptions}
            accountOptions={accountOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This budget could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={BUDGET_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
