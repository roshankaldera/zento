"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ERPDataTable } from "@/components/data-table"
import { deleteJournalCategory } from "@/lib/journal-category-service"
import type { JournalCategory } from "@/types/journal-category"
import { getJournalCategoryColumns } from "./journal-category-columns"
import {
  JOURNAL_CATEGORY_NEW_PATH,
  journalCategoryEditPath,
} from "./constants"

interface JournalCategoryListScreenProps {
  /** List fetched on the server (RSC) so the table paints populated. */
  initialJournalCategories: JournalCategory[]
  /** Set when the server-side fetch failed. */
  error?: string | null
}

/**
 * Journal Category list screen. Data is fetched on the server and handed in via
 * `initialJournalCategories`, so there is no client fetch-on-mount waterfall.
 * Mutations call `router.refresh()`, which re-runs the server component and
 * streams the fresh list back into this component as new props.
 */
export function JournalCategoryListScreen({
  initialJournalCategories,
  error = null,
}: JournalCategoryListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  // Prefetch the create route so navigating to the form feels instant.
  React.useEffect(() => {
    router.prefetch(JOURNAL_CATEGORY_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (journalCategory: JournalCategory) => {
      await deleteJournalCategory(journalCategory.id)
      refresh()
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getJournalCategoryColumns({
        onEdit: (journalCategory) =>
          router.push(journalCategoryEditPath(journalCategory.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Journal Categories"
      description="Manage journal category sub-master records."
      columns={columns}
      data={initialJournalCategories}
      loading={isPending}
      error={error}
      getRowId={(c) => String(c.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="journal-categories"
      searchPlaceholder="Search journal categories..."
      emptyMessage="No journal categories yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(JOURNAL_CATEGORY_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
