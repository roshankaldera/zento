"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ERPDataTable } from "@/components/data-table"
import { deleteReimbursement } from "@/lib/reimbursement-service"
import type { Reimbursement } from "@/types/reimbursement"
import { getReimbursementColumns } from "./reimbursement-columns"
import {
  REIMBURSEMENT_NEW_PATH,
  reimbursementEditPath,
} from "./constants"

interface ReimbursementListScreenProps {
  initialReimbursements: Reimbursement[]
  error?: string | null
}

export function ReimbursementListScreen({
  initialReimbursements,
  error = null,
}: ReimbursementListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(REIMBURSEMENT_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (row: Reimbursement) => {
      await deleteReimbursement(row.id)
      refresh()
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getReimbursementColumns({
        onEdit: (row) => router.push(reimbursementEditPath(row.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Reimbursements"
      description="Manage reimbursement claims and their bill lines."
      columns={columns}
      data={initialReimbursements}
      loading={isPending}
      error={error}
      getRowId={(r) => String(r.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="reimbursements"
      searchPlaceholder="Search by reimbursement no..."
      emptyMessage="No reimbursements yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(REIMBURSEMENT_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
