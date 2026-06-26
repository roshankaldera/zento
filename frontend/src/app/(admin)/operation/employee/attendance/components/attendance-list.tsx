"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ERPDataTable } from "@/components/data-table"
import { AttendanceApiError, deleteAttendance } from "@/lib/attendance-service"
import type { Attendance } from "@/types/attendance"
import { getAttendanceColumns } from "./attendance-columns"
import { ATTENDANCE_NEW_PATH, attendanceEditPath } from "./constants"

interface AttendanceListScreenProps {
  initialAttendances: Attendance[]
  error?: string | null
}

export function AttendanceListScreen({
  initialAttendances,
  error = null,
}: AttendanceListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(ATTENDANCE_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (attendance: Attendance) => {
      try {
        await deleteAttendance(attendance.id)
        toast.success("Attendance deleted.")
        refresh()
      } catch (err) {
        toast.error(
          err instanceof AttendanceApiError
            ? err.message
            : "Failed to delete attendance. Please try again.",
        )
      }
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getAttendanceColumns({
        onEdit: (attendance) => router.push(attendanceEditPath(attendance.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Attendance"
      description="Manage daily attendance records."
      columns={columns}
      data={initialAttendances}
      loading={isPending}
      error={error}
      getRowId={(a) => String(a.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="attendance"
      searchPlaceholder="Search attendance..."
      emptyMessage="No attendance records yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(ATTENDANCE_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
