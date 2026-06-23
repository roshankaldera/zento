"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ERPDataTable } from "@/components/data-table"
import { deleteBank } from "@/lib/bank-service"
import type { Bank } from "@/types/bank"
import { getBankColumns } from "./bank-columns"
import { BANK_NEW_PATH, bankEditPath } from "./constants"

interface BankListScreenProps {
  /** List fetched on the server (RSC) so the table paints populated. */
  initialBanks: Bank[]
  /** Set when the server-side fetch failed. */
  error?: string | null
}

/**
 * Bank list screen. Data is fetched on the server and handed in via
 * `initialBanks`, so there is no client fetch-on-mount waterfall. Mutations call
 * `router.refresh()`, which re-runs the server component and streams the fresh
 * list back into this component as new props.
 */
export function BankListScreen({ initialBanks, error = null }: BankListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  // Prefetch the create route so navigating to the form feels instant.
  React.useEffect(() => {
    router.prefetch(BANK_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (bank: Bank) => {
      await deleteBank(bank.id)
      refresh()
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getBankColumns({
        onEdit: (bank) => router.push(bankEditPath(bank.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Banks"
      description="Manage bank & petty cash master records."
      columns={columns}
      data={initialBanks}
      loading={isPending}
      error={error}
      getRowId={(b) => String(b.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="banks"
      searchPlaceholder="Search banks..."
      emptyMessage="No banks yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(BANK_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
