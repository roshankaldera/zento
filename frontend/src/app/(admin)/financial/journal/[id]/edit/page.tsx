import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { Metadata } from "next"
import Link from "next/link"
import React from "react"

import { Button } from "@/components/ui/button"
import { getJournal } from "@/lib/journal-service"
import { JournalForm } from "../../components/journal-form"
import { toJournalFormValues } from "../../components/journal-schema"
import { loadJournalOptions } from "../../components/journal-options"
import { JOURNAL_LIST_PATH } from "../../components/constants"

export const metadata: Metadata = {
  title: "Edit Journal | Zento",
  description: "Update an existing journal voucher",
}

export default async function EditJournalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [journal, options] = await Promise.all([
    Number.isFinite(Number(id)) ? getJournal(Number(id)) : undefined,
    loadJournalOptions(),
  ])

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Journal" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {journal ? (
          <JournalForm
            mode="edit"
            journalId={journal.id}
            defaultValues={toJournalFormValues(journal)}
            {...options}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This journal could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={JOURNAL_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
