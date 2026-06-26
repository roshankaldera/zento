"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ERPDataTable } from "@/components/data-table"
import { BookingApiError, deleteBooking } from "@/lib/booking-service"
import type { Booking } from "@/types/booking"
import { getBookingColumns } from "./booking-columns"
import { BOOKING_NEW_PATH, bookingEditPath } from "./constants"

interface BookingListScreenProps {
  initialBookings: Booking[]
  error?: string | null
}

export function BookingListScreen({
  initialBookings,
  error = null,
}: BookingListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(BOOKING_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (booking: Booking) => {
      try {
        await deleteBooking(booking.id)
        toast.success("Booking deleted.")
        refresh()
      } catch (err) {
        // A booking with linked KOTs can't be deleted — surface the reason.
        toast.error(
          err instanceof BookingApiError
            ? err.message
            : "Failed to delete booking. Please try again.",
        )
      }
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getBookingColumns({
        onEdit: (booking) => router.push(bookingEditPath(booking.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Bookings"
      description="Manage villa booking records."
      columns={columns}
      data={initialBookings}
      loading={isPending}
      error={error}
      getRowId={(b) => String(b.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="bookings"
      searchPlaceholder="Search by customer..."
      emptyMessage="No bookings yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(BOOKING_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
