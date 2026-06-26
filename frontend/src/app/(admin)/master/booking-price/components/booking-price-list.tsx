"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ERPDataTable } from "@/components/data-table"
import {
  BookingPriceApiError,
  deleteBookingPrice,
} from "@/lib/booking-price-service"
import type { BookingPriceList } from "@/types/booking-price"
import { getBookingPriceColumns } from "./booking-price-columns"
import {
  BOOKING_PRICE_NEW_PATH,
  bookingPriceEditPath,
} from "./constants"

interface BookingPriceListScreenProps {
  initialBookingPrices: BookingPriceList[]
  error?: string | null
}

export function BookingPriceListScreen({
  initialBookingPrices,
  error = null,
}: BookingPriceListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(BOOKING_PRICE_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (bookingPrice: BookingPriceList) => {
      try {
        await deleteBookingPrice(bookingPrice.id)
        toast.success("Booking price deleted.")
        refresh()
      } catch (err) {
        toast.error(
          err instanceof BookingPriceApiError
            ? err.message
            : "Failed to delete booking price. Please try again.",
        )
      }
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getBookingPriceColumns({
        onEdit: (bookingPrice) =>
          router.push(bookingPriceEditPath(bookingPrice.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Booking Price"
      description="Manage villa room price lists per business and date range."
      columns={columns}
      data={initialBookingPrices}
      loading={isPending}
      error={error}
      getRowId={(b) => String(b.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="booking-price"
      searchPlaceholder="Search by business..."
      emptyMessage="No booking prices yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(BOOKING_PRICE_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
