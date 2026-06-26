"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ERPDataTable } from "@/components/data-table"
import { deleteRent, RentApiError } from "@/lib/rent-service"
import type { Rent } from "@/types/rent"
import { getRentColumns } from "./rent-columns"
import { RENT_NEW_PATH, rentEditPath } from "./constants"

interface RentListScreenProps {
  initialRents: Rent[]
  error?: string | null
}

export function RentListScreen({
  initialRents,
  error = null,
}: RentListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(RENT_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (rent: Rent) => {
      try {
        await deleteRent(rent.id)
        toast.success("Rent deleted.")
        refresh()
      } catch (err) {
        toast.error(
          err instanceof RentApiError
            ? err.message
            : "Failed to delete rent. Please try again.",
        )
      }
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getRentColumns({
        onEdit: (rent) => router.push(rentEditPath(rent.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Rent"
      description="Manage property rent agreements."
      columns={columns}
      data={initialRents}
      loading={isPending}
      error={error}
      getRowId={(r) => String(r.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="rent"
      searchPlaceholder="Search by tenant..."
      emptyMessage="No rent records yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(RENT_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
