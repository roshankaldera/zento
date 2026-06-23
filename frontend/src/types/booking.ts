/** 1 = Direct, 2 = 3rd Party. */
export type BookingCategory = 1 | 2
/** 1 = Tentative, 2 = Confirmed, 3 = Management. */
export type BookingStatus = 1 | 2 | 3
/** 1 = OTA, 2 = Direct. */
export type BookingSegment = 1 | 2
/** 1 = LKR, 2 = USD, 3 = EURO. */
export type BookingCurrency = 1 | 2 | 3

export interface Booking {
  id: number
  /** Generated booking number (varchar(15)); assigned server-side on save. */
  bookingNo: string | null
  businessId: number
  category: BookingCategory
  roomIds: number[]
  customer: string
  fromDate: string
  toDate: string
  pax: number
  child: number
  status: BookingStatus
  segment: BookingSegment
  currency: BookingCurrency
  /** Decimal money values are serialized as strings by Prisma. */
  exRate: number
  invoiceValue: number
  vat: number
  sscl: number
  grossRevenue: number
  commission: number
  netRevenue: number
  bankCharges: number
  finalRevenue: number
  tscCommission: number
  payout: number
  business?: { id: number; name: string }
}

/** Payload to create a booking (server assigns `id`). */
export interface CreateBookingInput {
  businessId: number
  category: BookingCategory
  roomIds: number[]
  customer: string
  fromDate: string
  toDate: string
  pax: number
  child: number
  status: BookingStatus
  segment: BookingSegment
  currency: BookingCurrency
  exRate: number
  invoiceValue: number
  vat: number
  sscl: number
  grossRevenue: number
  commission: number
  netRevenue: number
  bankCharges: number
  finalRevenue: number
  tscCommission: number
  payout: number
}

export type UpdateBookingInput = CreateBookingInput
