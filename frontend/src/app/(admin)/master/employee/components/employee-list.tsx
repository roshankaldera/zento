"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ERPDataTable } from "@/components/data-table"
import { deleteEmployee, EmployeeApiError } from "@/lib/employee-service"
import type { Employee } from "@/types/employee"
import { getEmployeeColumns } from "./employee-columns"
import { EMPLOYEE_NEW_PATH, employeeEditPath } from "./constants"

interface EmployeeListScreenProps {
  /** List fetched on the server (RSC) so the table paints populated. */
  initialEmployees: Employee[]
  /** Set when the server-side fetch failed. */
  error?: string | null
}

/**
 * Employee list screen. Data is fetched on the server and handed in via
 * `initialEmployees`, so there is no client fetch-on-mount waterfall. Mutations
 * call `router.refresh()`, which re-runs the server component and streams the
 * fresh list back into this component as new props.
 */
export function EmployeeListScreen({
  initialEmployees,
  error = null,
}: EmployeeListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  // Prefetch the create route so navigating to the form feels instant.
  React.useEffect(() => {
    router.prefetch(EMPLOYEE_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (employee: Employee) => {
      try {
        await deleteEmployee(employee.id)
        toast.success("Employee deleted.")
        refresh()
      } catch (err) {
        toast.error(
          err instanceof EmployeeApiError
            ? err.message
            : "Failed to delete employee. Please try again.",
        )
      }
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getEmployeeColumns({
        onEdit: (employee) => router.push(employeeEditPath(employee.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Employees"
      description="Manage employee master records."
      columns={columns}
      data={initialEmployees}
      loading={isPending}
      error={error}
      getRowId={(e) => String(e.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="employees"
      searchPlaceholder="Search employees..."
      emptyMessage="No employees yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(EMPLOYEE_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
