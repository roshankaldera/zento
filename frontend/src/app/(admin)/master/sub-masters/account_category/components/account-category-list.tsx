"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ERPDataTable } from "@/components/data-table"
import {
  AccountCategoryApiError,
  deleteAccountCategory,
} from "@/lib/account-category-service"
import type { AccountCategory } from "@/types/account-category"
import { getAccountCategoryColumns } from "./account-category-columns"
import {
  ACCOUNT_CATEGORY_NEW_PATH,
  accountCategoryEditPath,
} from "./constants"

interface AccountCategoryListScreenProps {
  /** List fetched on the server (RSC) so the table paints populated. */
  initialAccountCategories: AccountCategory[]
  /** Set when the server-side fetch failed. */
  error?: string | null
}

/**
 * Account Category list screen. Data is fetched on the server and handed in via
 * `initialAccountCategories`, so there is no client fetch-on-mount waterfall.
 * Mutations call `router.refresh()`, which re-runs the server component and
 * streams the fresh list back into this component as new props.
 */
export function AccountCategoryListScreen({
  initialAccountCategories,
  error = null,
}: AccountCategoryListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  // Prefetch the create route so navigating to the form feels instant.
  React.useEffect(() => {
    router.prefetch(ACCOUNT_CATEGORY_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (accountCategory: AccountCategory) => {
      try {
        await deleteAccountCategory(accountCategory.id)
        toast.success("Account category deleted.")
        refresh()
      } catch (err) {
        toast.error(
          err instanceof AccountCategoryApiError
            ? err.message
            : "Failed to delete account category. Please try again.",
        )
      }
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getAccountCategoryColumns({
        onEdit: (accountCategory) =>
          router.push(accountCategoryEditPath(accountCategory.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Account Categories"
      description="Manage account category sub-master records."
      columns={columns}
      data={initialAccountCategories}
      loading={isPending}
      error={error}
      getRowId={(c) => String(c.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="account-categories"
      searchPlaceholder="Search account categories..."
      emptyMessage="No account categories yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(ACCOUNT_CATEGORY_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
