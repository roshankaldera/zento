import type {
  Booking,
  CreateBookingInput,
  UpdateBookingInput,
} from "@/types/booking"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/bookings`

interface BookingListResponse {
  data: Booking[]
  total: number
  page: number
  limit: number
}

export class BookingApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "BookingApiError"
  }
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] }
    if (Array.isArray(body.message)) return body.message.join(", ")
    if (body.message) return body.message
  } catch {
    // fall through to status text
  }
  return response.statusText || "Request failed"
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  })

  if (!response.ok) {
    const message = await readError(response)
    throw new BookingApiError(message, response.status)
  }

  return (await response.json()) as T
}

function toPayload(input: CreateBookingInput | UpdateBookingInput) {
  return {
    businessId: input.businessId,
    category: input.category,
    roomIds: input.roomIds,
    customer: input.customer.trim(),
    fromDate: input.fromDate,
    toDate: input.toDate,
    pax: input.pax,
    child: input.child,
    status: input.status,
    segment: input.segment,
    currency: input.currency,
    exRate: input.exRate,
    invoiceValue: input.invoiceValue,
    vat: input.vat,
    sscl: input.sscl,
    grossRevenue: input.grossRevenue,
    commission: input.commission,
    netRevenue: input.netRevenue,
    bankCharges: input.bankCharges,
    finalRevenue: input.finalRevenue,
    tscCommission: input.tscCommission,
    payout: input.payout,
  }
}

export async function listBookings(): Promise<Booking[]> {
  const result = await request<BookingListResponse>(`${BASE_URL}?limit=1000`, {
    cache: "no-store",
  })
  return result.data
}

export async function getBooking(id: number): Promise<Booking | undefined> {
  try {
    return await request<Booking>(`${BASE_URL}/${id}`, { cache: "no-store" })
  } catch (error) {
    if (error instanceof BookingApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  return request<Booking>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateBooking(
  id: number,
  input: UpdateBookingInput,
): Promise<Booking> {
  return request<Booking>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteBooking(id: number): Promise<void> {
  await request<Booking>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
