/**
 * Booking Price domain types.
 *
 * A `booking_price_list` header (one Business + a date range) owns many
 * `booking_price_line` rows (one per villa room, with four price tiers). A line
 * cannot exist without its header (cascade delete); a header needs ≥1 line.
 */

export interface BookingPriceLine {
  id: number
  mainId: number
  roomId: number
  /** Decimals serialized as strings by Prisma. */
  otaPrice: number
  directPrice: number
  dmcPrice: number
  localPrice: number
}

export interface BookingPriceList {
  id: number
  businessId: number
  /** Date-only ISO strings from the API. */
  fromDate: string
  toDate: string
  remark: string | null
  /** Present on detail (findOne) responses. */
  lines?: BookingPriceLine[]
  /** Joined business name, included by the API. */
  business?: { id: number; name: string }
  /** Present on list (findAll) responses. */
  _count?: { lines: number }
}

/** A single price line in the create/update payload (server assigns id + main_id). */
export interface CreateBookingPriceLineInput {
  roomId: number
  otaPrice: number
  directPrice: number
  dmcPrice: number
  localPrice: number
}

/** Payload to create a booking price header together with its lines. */
export interface CreateBookingPriceInput {
  businessId: number
  fromDate: string
  toDate: string
  remark?: string | null
  lines: CreateBookingPriceLineInput[]
}

export type UpdateBookingPriceInput = CreateBookingPriceInput
