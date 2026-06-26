"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ERPDataTable } from "@/components/data-table"
import { deleteRecurring, RecurringApiError } from "@/lib/recurring-service"
import type { Recurring } from "@/types/recurring"
import { getRecurringColumns } from "./recurring-columns"
import { RECURRING_NEW_PATH, recurringEditPath } from "./constants"

interface RecurringListScreenProps {
  initialRecurrings: Recurring[]
  error?: string | null
}

export function RecurringListScreen({
  initialRecurrings,
  error = null,
}: RecurringListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(RECURRING_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (row: Recurring) => {
      try {
        await deleteRecurring(row.id)
        toast.success("Recurring deleted.")
        refresh()
      } catch (err) {
        toast.error(
          err instanceof RecurringApiError
            ? err.message
            : "Failed to delete recurring. Please try again.",
        )
      }
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getRecurringColumns({
        onEdit: (row) => router.push(recurringEditPath(row.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Recurrings"
      description="Manage recurring journal templates and their account lines."
      columns={columns}
      data={initialRecurrings}
      loading={isPending}
      error={error}
      getRowId={(r) => String(r.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="recurrings"
      searchPlaceholder="Search by business..."
      emptyMessage="No recurrings yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(RECURRING_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
