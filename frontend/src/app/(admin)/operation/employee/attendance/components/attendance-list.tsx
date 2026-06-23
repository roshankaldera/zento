"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ERPDataTable } from "@/components/data-table"
import { deleteAttendance } from "@/lib/attendance-service"
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
      await deleteAttendance(attendance.id)
      refresh()
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
