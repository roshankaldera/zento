"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ERPDataTable } from "@/components/data-table"
import { deleteLeave } from "@/lib/leave-service"
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
      await deleteLeave(leave.id)
      refresh()
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
