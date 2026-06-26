"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ERPDataTable } from "@/components/data-table"
import { deleteLeave, LeaveApiError } from "@/lib/leave-service"
import type { Leave } from "@/types/leave"
import { getLeaveColumns } from "./leave-columns"
import { LEAVE_NEW_PATH, leaveEditPath } from "./constants"

interface LeaveListScreenProps {
  initialLeaves: Leave[]
  error?: string | null
}

export function LeaveListScreen({
  initialLeaves,
  error = null,
}: LeaveListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(LEAVE_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (leave: Leave) => {
      try {
        await deleteLeave(leave.id)
        toast.success("Leave deleted.")
        refresh()
      } catch (err) {
        toast.error(
          err instanceof LeaveApiError
            ? err.message
            : "Failed to delete leave. Please try again.",
        )
      }
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getLeaveColumns({
        onEdit: (leave) => router.push(leaveEditPath(leave.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Leaves"
      description="Manage employee leave records."
      columns={columns}
      data={initialLeaves}
      loading={isPending}
      error={error}
      getRowId={(l) => String(l.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="leaves"
      searchPlaceholder="Search leaves..."
      emptyMessage="No leaves yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(LEAVE_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
