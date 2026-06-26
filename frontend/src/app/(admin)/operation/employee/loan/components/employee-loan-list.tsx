"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ERPDataTable } from "@/components/data-table"
import { deleteEmployeeLoan, EmployeeLoanApiError } from "@/lib/employee-loan-service"
import type { EmployeeLoan } from "@/types/employee-loan"
import { getEmployeeLoanColumns } from "./employee-loan-columns"
import { EMPLOYEE_LOAN_NEW_PATH, employeeLoanEditPath } from "./constants"

interface EmployeeLoanListScreenProps {
  initialEmployeeLoans: EmployeeLoan[]
  error?: string | null
}

export function EmployeeLoanListScreen({
  initialEmployeeLoans,
  error = null,
}: EmployeeLoanListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(EMPLOYEE_LOAN_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (loan: EmployeeLoan) => {
      try {
        await deleteEmployeeLoan(loan.id)
        toast.success("Loan deleted.")
        refresh()
      } catch (err) {
        toast.error(
          err instanceof EmployeeLoanApiError
            ? err.message
            : "Failed to delete loan. Please try again.",
        )
      }
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getEmployeeLoanColumns({
        onEdit: (loan) => router.push(employeeLoanEditPath(loan.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Employee Loans"
      description="Manage employee loan records."
      columns={columns}
      data={initialEmployeeLoans}
      loading={isPending}
      error={error}
      getRowId={(l) => String(l.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="employee-loans"
      searchPlaceholder="Search loans..."
      emptyMessage="No employee loans yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(EMPLOYEE_LOAN_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
