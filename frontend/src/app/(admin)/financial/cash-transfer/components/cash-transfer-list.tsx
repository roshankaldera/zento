"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ERPDataTable } from "@/components/data-table"
import {
  CashTransferApiError,
  deleteCashTransfer,
} from "@/lib/cash-transfer-service"
import type { CashTransfer } from "@/types/cash-transfer"
import { getCashTransferColumns } from "./cash-transfer-columns"
import {
  CASH_TRANSFER_NEW_PATH,
  cashTransferEditPath,
} from "./constants"

interface CashTransferListScreenProps {
  initialCashTransfers: CashTransfer[]
  error?: string | null
}

export function CashTransferListScreen({
  initialCashTransfers,
  error = null,
}: CashTransferListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(CASH_TRANSFER_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (row: CashTransfer) => {
      try {
        await deleteCashTransfer(row.id)
        toast.success("Cash transfer deleted.")
        refresh()
      } catch (err) {
        toast.error(
          err instanceof CashTransferApiError
            ? err.message
            : "Failed to delete cash transfer. Please try again.",
        )
      }
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getCashTransferColumns({
        onEdit: (row) => router.push(cashTransferEditPath(row.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Cash Transfers"
      description="Manage cash transfers between banks."
      columns={columns}
      data={initialCashTransfers}
      loading={isPending}
      error={error}
      getRowId={(r) => String(r.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="cash-transfers"
      searchPlaceholder="Search by reference..."
      emptyMessage="No cash transfers yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(CASH_TRANSFER_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
