"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ERPDataTable } from "@/components/data-table"
import { deleteBudget } from "@/lib/budget-service"
import type { Budget } from "@/types/budget"
import { getBudgetColumns } from "./budget-columns"
import { BUDGET_NEW_PATH, budgetEditPath } from "./constants"

interface BudgetListScreenProps {
  initialBudgets: Budget[]
  error?: string | null
}

export function BudgetListScreen({
  initialBudgets,
  error = null,
}: BudgetListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(BUDGET_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (row: Budget) => {
      await deleteBudget(row.id)
      refresh()
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getBudgetColumns({
        onEdit: (row) => router.push(budgetEditPath(row.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Budgets"
      description="Manage yearly budgets per business."
      columns={columns}
      data={initialBudgets}
      loading={isPending}
      error={error}
      getRowId={(b) => String(b.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="budgets"
      searchPlaceholder="Search by business..."
      emptyMessage="No budgets yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(BUDGET_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
