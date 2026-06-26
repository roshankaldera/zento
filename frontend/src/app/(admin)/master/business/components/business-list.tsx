"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ERPDataTable } from "@/components/data-table"
import { BusinessApiError, deleteBusiness } from "@/lib/business-service"
import type { Business } from "@/types/business"
import { getBusinessColumns } from "./business-columns"
import { BUSINESS_NEW_PATH, businessEditPath } from "./constants"

interface BusinessListScreenProps {
  /** List fetched on the server (RSC) so the table paints populated. */
  initialBusinesses: Business[]
  /** Set when the server-side fetch failed. */
  error?: string | null
}

/**
 * Business list screen. Data is fetched on the server and handed in via
 * `initialBusinesses`, so there is no client fetch-on-mount waterfall. Mutations
 * call `router.refresh()`, which re-runs the server component and streams the
 * fresh list back into this component as new props.
 */
export function BusinessListScreen({
  initialBusinesses,
  error = null,
}: BusinessListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  // Prefetch the create route so navigating to the form feels instant.
  React.useEffect(() => {
    router.prefetch(BUSINESS_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (business: Business) => {
      try {
        await deleteBusiness(business.id)
        toast.success("Business deleted.")
        refresh()
      } catch (err) {
        toast.error(
          err instanceof BusinessApiError
            ? err.message
            : "Failed to delete business. Please try again.",
        )
      }
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getBusinessColumns({
        onEdit: (business) => router.push(businessEditPath(business.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Businesses"
      description="Manage business master records."
      columns={columns}
      data={initialBusinesses}
      loading={isPending}
      error={error}
      getRowId={(b) => String(b.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="businesses"
      searchPlaceholder="Search businesses..."
      emptyMessage="No businesses yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(BUSINESS_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
