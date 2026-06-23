"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ERPDataTable } from "@/components/data-table"
import { deleteJournal } from "@/lib/journal-service"
import type { Journal } from "@/types/journal"
import { getJournalColumns } from "./journal-columns"
import { JOURNAL_NEW_PATH, journalEditPath } from "./constants"

interface JournalListScreenProps {
  initialJournals: Journal[]
  error?: string | null
}

export function JournalListScreen({
  initialJournals,
  error = null,
}: JournalListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(JOURNAL_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (row: Journal) => {
      await deleteJournal(row.id)
      refresh()
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getJournalColumns({
        onEdit: (row) => router.push(journalEditPath(row.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Journals"
      description="Manage journal vouchers and their account lines."
      columns={columns}
      data={initialJournals}
      loading={isPending}
      error={error}
      getRowId={(j) => String(j.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="journals"
      searchPlaceholder="Search by journal no..."
      emptyMessage="No journals yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(JOURNAL_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
