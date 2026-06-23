import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { Metadata } from "next"
import Link from "next/link"
import React from "react"

import { Button } from "@/components/ui/button"
import { getRecurring } from "@/lib/recurring-service"
import { RecurringForm } from "../../components/recurring-form"
import { toRecurringFormValues } from "../../components/recurring-schema"
import { loadRecurringOptions } from "../../components/recurring-options"
import { RECURRING_LIST_PATH } from "../../components/constants"

export const metadata: Metadata = {
  title: "Edit Recurring | Zento",
  description: "Update an existing recurring template",
}

export default async function EditRecurringPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [recurring, options] = await Promise.all([
    Number.isFinite(Number(id)) ? getRecurring(Number(id)) : undefined,
    loadRecurringOptions(),
  ])

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Recurring" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {recurring ? (
          <RecurringForm
            mode="edit"
            recurringId={recurring.id}
            defaultValues={toRecurringFormValues(recurring)}
            {...options}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This recurring could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={RECURRING_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
