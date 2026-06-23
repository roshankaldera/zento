/**
 * Bank data service — HTTP client for the NestJS CRUD API.
 *
 * Every function returns the same shapes the in-app screens consume (list / form
 * / edit). The base URL comes from `NEXT_PUBLIC_API_URL`. The `bank` table has no
 * unique business key, so there is no duplicate (409) path.
 *
 * Backend contract:
 *   POST   /banks            { businessId, type, bank, branch?, accountNo?, cashFloat?, balance?, status? } -> Bank
 *   GET    /banks            ?page&limit&search&status   -> { data, total, page, limit }
 *   GET    /banks/:id                                    -> Bank
 *   PATCH  /banks/:id        partial { ... }             -> Bank
 *   DELETE /banks/:id                                    -> Bank
 */

import type { Bank, CreateBankInput, UpdateBankInput } from "@/types/bank"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/banks`

/** Shape returned by the list endpoint. */
interface BankListResponse {
  data: Bank[]
  total: number
  page: number
  limit: number
}

/** Generic API error carrying the backend's message + status code. */
export class BankApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "BankApiError"
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

/** Perform a fetch and parse JSON, mapping error statuses to a typed error. */
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  })

  if (!response.ok) {
    throw new BankApiError(await readError(response), response.status)
  }

  return (await response.json()) as T
}

/** Trim strings; empty optional text -> null so the backend stores null, not "". */
function toPayload(input: CreateBankInput | UpdateBankInput) {
  const clean = (v?: string | null) => {
    const t = v?.trim()
    return t ? t : null
  }
  return {
    businessId: input.businessId,
    type: input.type,
    bank: input.bank.trim(),
    branch: clean(input.branch),
    accountNo: clean(input.accountNo),
    cashFloat: input.cashFloat,
    balance: input.balance,
    status: input.status,
  }
}

export async function listBanks(): Promise<Bank[]> {
  // The list screen filters/paginates client-side, so fetch the full set.
  // `no-store` keeps the data fresh when this runs in a Server Component.
  const result = await request<BankListResponse>(`${BASE_URL}?limit=1000`, {
    cache: "no-store",
  })
  return result.data
}

export async function getBank(id: number): Promise<Bank | undefined> {
  try {
    return await request<Bank>(`${BASE_URL}/${id}`, { cache: "no-store" })
  } catch (error) {
    if (error instanceof BankApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createBank(input: CreateBankInput): Promise<Bank> {
  return request<Bank>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateBank(
  id: number,
  input: UpdateBankInput,
): Promise<Bank> {
  return request<Bank>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteBank(id: number): Promise<void> {
  await request<Bank>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
