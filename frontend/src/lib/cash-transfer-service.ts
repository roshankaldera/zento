import type {
  CashTransfer,
  CreateCashTransferInput,
  UpdateCashTransferInput,
} from "@/types/cash-transfer"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/cash-transfers`

interface CashTransferListResponse {
  data: CashTransfer[]
  total: number
  page: number
  limit: number
}

/** Generic API error carrying the backend's message + status code. */
export class CashTransferApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "CashTransferApiError"
  }
}

/** Pull a human-readable message out of a Nest error body ({ message }). */
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
    throw new CashTransferApiError(await readError(response), response.status)
  }

  return (await response.json()) as T
}

/** Trim strings; empty optional text -> null so the backend stores null, not "". */
function toPayload(input: CreateCashTransferInput | UpdateCashTransferInput) {
  const clean = (v?: string | null) => {
    const t = v?.trim()
    return t ? t : null
  }
  return {
    fromBank: input.fromBank,
    toBank: input.toBank,
    date: input.date,
    value: input.value,
    description: clean(input.description),
    reference: clean(input.reference),
    postBy: input.postBy,
    status: input.status,
  }
}

export async function listCashTransfers(): Promise<CashTransfer[]> {
  const result = await request<CashTransferListResponse>(
    `${BASE_URL}?limit=1000`,
    { cache: "no-store" },
  )
  return result.data
}

export async function getCashTransfer(
  id: number,
): Promise<CashTransfer | undefined> {
  try {
    return await request<CashTransfer>(`${BASE_URL}/${id}`, {
      cache: "no-store",
    })
  } catch (error) {
    if (error instanceof CashTransferApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createCashTransfer(
  input: CreateCashTransferInput,
): Promise<CashTransfer> {
  return request<CashTransfer>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateCashTransfer(
  id: number,
  input: UpdateCashTransferInput,
): Promise<CashTransfer> {
  return request<CashTransfer>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteCashTransfer(id: number): Promise<void> {
  await request<CashTransfer>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
