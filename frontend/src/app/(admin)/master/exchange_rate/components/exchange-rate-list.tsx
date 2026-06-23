"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ERPDataTable } from "@/components/data-table"
import { deleteExchangeRate } from "@/lib/exchange-rate-service"
import type { ExchangeRate } from "@/types/exchange-rate"
import { getExchangeRateColumns } from "./exchange-rate-columns"
import {
  EXCHANGE_RATE_NEW_PATH,
  exchangeRateEditPath,
} from "./constants"

interface ExchangeRateListScreenProps {
  initialExchangeRates: ExchangeRate[]
  error?: string | null
}

export function ExchangeRateListScreen({
  initialExchangeRates,
  error = null,
}: ExchangeRateListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(EXCHANGE_RATE_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (rate: ExchangeRate) => {
      await deleteExchangeRate(rate.id)
      refresh()
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getExchangeRateColumns({
        onEdit: (rate) => router.push(exchangeRateEditPath(rate.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Exchange Rates"
      description="Manage daily currency exchange rates."
      columns={columns}
      data={initialExchangeRates}
      loading={isPending}
      error={error}
      getRowId={(r) => String(r.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="exchange-rates"
      searchPlaceholder="Search exchange rates..."
      emptyMessage="No exchange rates yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(EXCHANGE_RATE_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
