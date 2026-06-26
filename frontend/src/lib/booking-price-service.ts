import type {
  BookingPriceList,
  CreateBookingPriceInput,
  UpdateBookingPriceInput,
} from "@/types/booking-price"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/booking-price-lists`

interface BookingPriceListResponse {
  data: BookingPriceList[]
  total: number
  page: number
  limit: number
}

/** Generic API error carrying the backend's message + status code. */
export class BookingPriceApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "BookingPriceApiError"
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
    throw new BookingPriceApiError(message, response.status)
  }

  return (await response.json()) as T
}

function toPayload(input: CreateBookingPriceInput | UpdateBookingPriceInput) {
  const remark = input.remark?.trim()
  return {
    businessId: input.businessId,
    fromDate: input.fromDate,
    toDate: input.toDate,
    remark: remark ? remark : null,
    lines: input.lines.map((line) => ({
      roomId: line.roomId,
      otaPrice: line.otaPrice,
      directPrice: line.directPrice,
      dmcPrice: line.dmcPrice,
      localPrice: line.localPrice,
    })),
  }
}

export async function listBookingPrices(): Promise<BookingPriceList[]> {
  const result = await request<BookingPriceListResponse>(
    `${BASE_URL}?limit=1000`,
    { cache: "no-store" },
  )
  return result.data
}

export async function getBookingPrice(
  id: number,
): Promise<BookingPriceList | undefined> {
  try {
    return await request<BookingPriceList>(`${BASE_URL}/${id}`, {
      cache: "no-store",
    })
  } catch (error) {
    if (error instanceof BookingPriceApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createBookingPrice(
  input: CreateBookingPriceInput,
): Promise<BookingPriceList> {
  return request<BookingPriceList>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateBookingPrice(
  id: number,
  input: UpdateBookingPriceInput,
): Promise<BookingPriceList> {
  return request<BookingPriceList>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteBookingPrice(id: number): Promise<void> {
  await request<BookingPriceList>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
