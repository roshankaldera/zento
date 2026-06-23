/**
 * Business data service — HTTP client for the NestJS CRUD API.
 *
 * Every function returns the same shapes the in-app screens consume (list / form
 * / edit). The base URL comes from `NEXT_PUBLIC_API_URL`.
 *
 * Backend contract:
 *   POST   /businesses            { name, type, contactPerson?, remark?, status? }   -> Business
 *   GET    /businesses            ?page&limit&search&status                          -> { data, total, page, limit }
 *   GET    /businesses/:id                                                           -> Business
 *   PATCH  /businesses/:id        partial { name, type, contactPerson, remark, status } -> Business
 *   DELETE /businesses/:id                                                           -> Business
 */

import type {
  Business,
  CreateBusinessInput,
  UpdateBusinessInput,
} from "@/types/business"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/businesses`

/** Shape returned by the list endpoint. */
interface BusinessListResponse {
  data: Business[]
  total: number
  page: number
  limit: number
}

/** Thrown when a name collides with an existing record (HTTP 409). */
export class DuplicateBusinessNameError extends Error {
  constructor(name: string) {
    super(`A business named "${name}" already exists.`)
    this.name = "DuplicateBusinessNameError"
  }
}

/** Generic API error carrying the backend's message + status code. */
export class BusinessApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "BusinessApiError"
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

/** Perform a fetch and parse JSON, mapping error statuses to typed errors. */
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  })

  if (!response.ok) {
    const message = await readError(response)
    if (response.status === 409) {
      throw new DuplicateBusinessNameError(message)
    }
    throw new BusinessApiError(message, response.status)
  }

  return (await response.json()) as T
}

/** Trim a single child line; empty remark -> null. */
function toLinePayload(line: {
  name: string
  remark?: string | null
  status: number
}) {
  const remark = line.remark?.trim()
  return {
    name: line.name.trim(),
    remark: remark ? remark : null,
    status: line.status,
  }
}

/** Trim strings; empty optional text -> null so the backend stores null, not "". */
function toPayload(input: CreateBusinessInput | UpdateBusinessInput) {
  const contactPerson = input.contactPerson?.trim()
  const remark = input.remark?.trim()
  return {
    name: input.name.trim(),
    type: input.type,
    contactPerson: contactPerson ? contactPerson : null,
    remark: remark ? remark : null,
    status: input.status,
    estateDivisions: (input.estateDivisions ?? []).map(toLinePayload),
    villaRooms: (input.villaRooms ?? []).map(toLinePayload),
  }
}

export async function listBusinesses(): Promise<Business[]> {
  // The list screen filters/paginates client-side, so fetch the full set.
  // `no-store` keeps the data fresh when this runs in a Server Component.
  const result = await request<BusinessListResponse>(`${BASE_URL}?limit=1000`, {
    cache: "no-store",
  })
  return result.data
}

export async function getBusiness(id: number): Promise<Business | undefined> {
  try {
    return await request<Business>(`${BASE_URL}/${id}`, { cache: "no-store" })
  } catch (error) {
    if (error instanceof BusinessApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createBusiness(
  input: CreateBusinessInput,
): Promise<Business> {
  return request<Business>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateBusiness(
  id: number,
  input: UpdateBusinessInput,
): Promise<Business> {
  return request<Business>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteBusiness(id: number): Promise<void> {
  await request<Business>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
