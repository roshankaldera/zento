"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ERPDataTable } from "@/components/data-table"
import { AccountApiError, deleteAccount } from "@/lib/account-service"
import type { Account } from "@/types/account"
import { getAccountColumns } from "./account-columns"
import { ACCOUNT_NEW_PATH, accountEditPath } from "./constants"

interface AccountListScreenProps {
  initialAccounts: Account[]
  error?: string | null
}

export function AccountListScreen({
  initialAccounts,
  error = null,
}: AccountListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(ACCOUNT_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (account: Account) => {
      try {
        await deleteAccount(account.id)
        toast.success("Account deleted.")
        refresh()
      } catch (err) {
        toast.error(
          err instanceof AccountApiError
            ? err.message
            : "Failed to delete account. Please try again.",
        )
      }
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getAccountColumns({
        onEdit: (account) => router.push(accountEditPath(account.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Accounts"
      description="Manage account master records."
      columns={columns}
      data={initialAccounts}
      loading={isPending}
      error={error}
      getRowId={(a) => String(a.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="accounts"
      searchPlaceholder="Search by code or name..."
      emptyMessage="No accounts yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(ACCOUNT_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
