import type {
  CreateExchangeRateInput,
  ExchangeRate,
  UpdateExchangeRateInput,
} from "@/types/exchange-rate"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/exchange-rates`

interface ExchangeRateListResponse {
  data: ExchangeRate[]
  total: number
  page: number
  limit: number
}

/** Thrown on a 409 — a duplicate (currency + date). */
export class DuplicateExchangeRateError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DuplicateExchangeRateError"
  }
}

export class ExchangeRateApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "ExchangeRateApiError"
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
    if (response.status === 409) {
      throw new DuplicateExchangeRateError(message)
    }
    throw new ExchangeRateApiError(message, response.status)
  }

  return (await response.json()) as T
}

function toPayload(input: CreateExchangeRateInput | UpdateExchangeRateInput) {
  return {
    currencyId: input.currencyId,
    date: input.date,
    rate: input.rate,
  }
}

export async function listExchangeRates(): Promise<ExchangeRate[]> {
  const result = await request<ExchangeRateListResponse>(
    `${BASE_URL}?limit=1000`,
    { cache: "no-store" },
  )
  return result.data
}

export async function getExchangeRate(
  id: number,
): Promise<ExchangeRate | undefined> {
  try {
    return await request<ExchangeRate>(`${BASE_URL}/${id}`, {
      cache: "no-store",
    })
  } catch (error) {
    if (error instanceof ExchangeRateApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createExchangeRate(
  input: CreateExchangeRateInput,
): Promise<ExchangeRate> {
  return request<ExchangeRate>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateExchangeRate(
  id: number,
  input: UpdateExchangeRateInput,
): Promise<ExchangeRate> {
  return request<ExchangeRate>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteExchangeRate(id: number): Promise<void> {
  await request<ExchangeRate>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
