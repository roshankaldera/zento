"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ERPDataTable } from "@/components/data-table"
import { deleteItemTransaction } from "@/lib/item-transaction-service"
import type { ItemTransaction } from "@/types/item-transaction"
import { getItemTransactionColumns } from "./item-transaction-columns"
import {
  ITEM_TRANSACTION_NEW_PATH,
  itemTransactionEditPath,
} from "./constants"

interface ItemTransactionListScreenProps {
  initialItemTransactions: ItemTransaction[]
  error?: string | null
}

export function ItemTransactionListScreen({
  initialItemTransactions,
  error = null,
}: ItemTransactionListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(ITEM_TRANSACTION_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (row: ItemTransaction) => {
      await deleteItemTransaction(row.id)
      refresh()
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getItemTransactionColumns({
        onEdit: (row) => router.push(itemTransactionEditPath(row.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Item Transactions"
      description="Manage inventory item receive / issue transactions."
      columns={columns}
      data={initialItemTransactions}
      loading={isPending}
      error={error}
      getRowId={(t) => String(t.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="item-transactions"
      searchPlaceholder="Search by business..."
      emptyMessage="No item transactions yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(ITEM_TRANSACTION_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
