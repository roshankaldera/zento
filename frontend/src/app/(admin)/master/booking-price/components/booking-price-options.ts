import type { Option } from "@/components/hook-form"
import { getBusiness, listBusinesses } from "@/lib/business-service"
import type { BusinessScopedOption } from "./booking-price-schema"

export interface BookingPriceOptions {
  /** Villa businesses (type 2) for the header FK select. */
  businessOptions: Option[]
  /** Every villa's rooms, tagged with the owning villa id (scoped by business). */
  roomOptions: BusinessScopedOption[]
}

/**
 * Load the villa + room options the booking-price form needs (server-side).
 * Rooms are only returned by the business detail endpoint, so each villa is
 * fetched once and its rooms flattened into a single business-tagged list.
 */
export async function loadBookingPriceOptions(): Promise<BookingPriceOptions> {
  const businesses = await listBusinesses().catch(() => [])
  const villas = businesses.filter((b) => b.type === 2)

  const businessOptions: Option[] = villas.map((b) => ({
    label: b.name,
    value: String(b.id),
  }))

  const details = await Promise.all(
    villas.map((v) => getBusiness(v.id).catch(() => undefined)),
  )
  const roomOptions: BusinessScopedOption[] = details.flatMap((biz) =>
    biz
      ? (biz.villaRooms ?? [])
          .slice()
          .sort((a, b) => a.id - b.id)
          .map((room) => ({
            label: room.name,
            value: String(room.id),
            businessId: biz.id,
          }))
      : [],
  )

  return { businessOptions, roomOptions }
}
