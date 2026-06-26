"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { RHFForm, RHFSelect, type Option } from "@/components/hook-form"
import { listBookings } from "@/lib/booking-service"
import { getBusiness } from "@/lib/business-service"
import type { Booking, BookingStatus } from "@/types/booking"
import type { BusinessLine } from "@/types/business"
import {
  BOOKING_LIST_PATH,
  BOOKING_NEW_PATH,
  bookingEditPath,
} from "./constants"

/** Selectable years for the calendar. */
const YEAR_OPTIONS: Option[] = ["2026", "2027", "2028", "2029", "2030"].map(
  (y) => ({ label: y, value: y }),
)

/** The 12 months, value = 1-based month number. */
const MONTH_OPTIONS: Option[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((label, i) => ({ label, value: String(i + 1) }))

/** Short day-of-week labels indexed by `Date.getDay()` (0 = Sun). */
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

/** Cell fill per booking status. */
const STATUS_CLASS: Record<BookingStatus, string> = {
  1: "bg-yellow-300 text-yellow-950 dark:bg-yellow-500/80 dark:text-yellow-50", // Tentative
  2: "bg-green-400 text-green-950 dark:bg-green-600/80 dark:text-green-50", // Confirmed
  3: "bg-blue-400 text-blue-950 dark:bg-blue-600/80 dark:text-blue-50", // Management
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  1: "Tentative",
  2: "Confirmed",
  3: "Management",
}

/** Ash fill for a vacant (unbooked) room cell. */
const VACANT_CLASS =
  "bg-gray-200 text-gray-500 dark:bg-gray-700/60 dark:text-gray-400"

const filterSchema = z.object({
  businessId: z.string().min(1, "Business is required"),
  year: z.string().min(1, "Year is required"),
  month: z.string().min(1, "Month is required"),
})

type FilterValues = z.infer<typeof filterSchema>

/** Zero-pad a number to two digits (e.g. 3 -> "03"). */
const pad2 = (n: number) => String(n).padStart(2, "0")

interface BookingCalendarProps {
  /** Villa businesses (type 2) for the picker, fetched server-side. */
  businessOptions: Option[]
}

/** The applied filter + the data fetched for it. */
interface CalendarData {
  year: number
  month: number
  rooms: BusinessLine[]
  bookings: Booking[]
}

export function BookingCalendar({ businessOptions }: BookingCalendarProps) {
  const router = useRouter()

  const now = new Date()
  const currentYear = String(now.getFullYear())
  const defaultYear = YEAR_OPTIONS.some((o) => o.value === currentYear)
    ? currentYear
    : YEAR_OPTIONS[0].value

  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    mode: "onBlur",
    defaultValues: {
      businessId: "",
      year: defaultYear,
      month: String(now.getMonth() + 1),
    },
  })

  const [data, setData] = React.useState<CalendarData | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const onView = React.useCallback(async (values: FilterValues) => {
    const businessId = Number(values.businessId)
    const year = Number(values.year)
    const month = Number(values.month)
    setLoading(true)
    setError(null)
    try {
      // Rooms come from the villa's detail record; bookings are filtered to the
      // selected business client-side.
      const [business, allBookings] = await Promise.all([
        getBusiness(businessId),
        listBookings(),
      ])
      const rooms = (business?.villaRooms ?? [])
        .slice()
        .sort((a, b) => a.id - b.id)
      const bookings = allBookings.filter((b) => b.businessId === businessId)
      setData({ year, month, rooms, bookings })
    } catch {
      setError("Failed to load the calendar. Please try again.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="grid gap-7">
      {/* Toolbar: jump to the list or to the new-booking form. */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(BOOKING_LIST_PATH)}
        >
          List
        </Button>
        <Button type="button" onClick={() => router.push(BOOKING_NEW_PATH)}>
          Booking
        </Button>
      </div>

      {/* Filter bar */}
      <RHFForm form={form} onSubmit={onView}>
        <div className="flex flex-wrap items-end gap-4">
          <RHFSelect<FilterValues>
            name="businessId"
            label="Business"
            required
            options={businessOptions}
            placeholder="Select a villa"
            triggerClassName="w-56"
          />
          <RHFSelect<FilterValues>
            name="year"
            label="Year"
            required
            options={YEAR_OPTIONS}
            placeholder="Select a year"
            triggerClassName="w-32"
          />
          <RHFSelect<FilterValues>
            name="month"
            label="Month"
            required
            options={MONTH_OPTIONS}
            placeholder="Select a month"
            triggerClassName="w-40"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Loading…" : "View"}
          </Button>
        </div>
      </RHFForm>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {data && <CalendarTable data={data} />}
    </div>
  )
}

/** The month grid: one row per day, one column per room. */
function CalendarTable({ data }: { data: CalendarData }) {
  const router = useRouter()
  const { year, month, rooms, bookings } = data

  // Number of days in the selected month (day 0 of next month = last of this).
  const daysInMonth = new Date(year, month, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Find the booking covering a given room on a given ISO day (yyyy-mm-dd).
  const bookingFor = (roomId: number, isoDay: string): Booking | undefined =>
    bookings.find(
      (b) =>
        b.roomIds.includes(roomId) &&
        b.fromDate.slice(0, 10) <= isoDay &&
        isoDay <= b.toDate.slice(0, 10),
    )

  if (rooms.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This villa has no rooms configured.
      </p>
    )
  }

  return (
    <div className="grid gap-3">
      <Legend />
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-muted/40 text-left text-muted-foreground dark:border-gray-800">
              <th className="w-16 px-3 py-2 font-medium">Date</th>
              <th className="w-16 px-3 py-2 font-medium">Day</th>
              {rooms.map((room) => (
                <th
                  key={room.id}
                  className="min-w-[120px] px-3 py-2 font-medium text-foreground"
                >
                  {room.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => {
              const isoDay = `${year}-${pad2(month)}-${pad2(day)}`
              const dow = new Date(year, month - 1, day).getDay()
              const isWeekend = dow === 0 || dow === 6
              return (
                <tr
                  key={day}
                  className="border-b border-gray-100 last:border-0 dark:border-gray-800/60"
                >
                  <td className="px-3 py-2 font-medium text-foreground">
                    {pad2(day)}
                  </td>
                  <td
                    className={
                      isWeekend
                        ? "px-3 py-2 font-medium text-destructive"
                        : "px-3 py-2 text-muted-foreground"
                    }
                  >
                    {DAY_LABELS[dow]}
                  </td>
                  {rooms.map((room) => {
                    const booking = bookingFor(room.id, isoDay)
                    return (
                      <td key={room.id} className="px-1 py-1">
                        {booking ? (
                          <button
                            type="button"
                            onClick={() =>
                              router.push(bookingEditPath(booking.id))
                            }
                            className={`flex h-10 w-full items-center truncate rounded px-2 text-left text-xs font-medium transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${STATUS_CLASS[booking.status]}`}
                            title={`${booking.customer} — ${STATUS_LABEL[booking.status]} (click to edit)`}
                          >
                            {booking.bookingNo} {" - "} {booking.customer}
                          </button>
                        ) : (
                          <div
                            className={`flex h-10 items-center truncate rounded px-2 text-xs font-medium ${VACANT_CLASS}`}
                            title="Vacant"
                          >
                            Vacant
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Colour key for the three booking statuses. */
function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      {([1, 2, 3] as BookingStatus[]).map((status) => (
        <span key={status} className="flex items-center gap-2">
          <span className={`inline-block h-4 w-4 rounded ${STATUS_CLASS[status]}`} />
          {STATUS_LABEL[status]}
        </span>
      ))}
      <span className="flex items-center gap-2">
        <span className={`inline-block h-4 w-4 rounded ${VACANT_CLASS}`} />
        Vacant
      </span>
    </div>
  )
}
