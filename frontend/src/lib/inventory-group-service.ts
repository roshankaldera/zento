/**
 * Inventory Group data service — HTTP client for the NestJS CRUD API.
 *
 * Every function returns the same shapes the in-app screens consume (list / form
 * / edit). The base URL comes from `NEXT_PUBLIC_API_URL`.
 *
 * Backend contract:
 *   POST   /inventory-groups            { name, remark?, status? }      -> InventoryGroup
 *   GET    /inventory-groups            ?page&limit&search&status        -> { data, total, page, limit }
 *   GET    /inventory-groups/:id                                         -> InventoryGroup
 *   PATCH  /inventory-groups/:id        partial { name, remark, status } -> InventoryGroup
 *   DELETE /inventory-groups/:id                                         -> InventoryGroup
 */

import type {
  CreateInventoryGroupInput,
  InventoryGroup,
  UpdateInventoryGroupInput,
} from "@/types/inventory-group"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/inventory-groups`

/** Shape returned by the list endpoint. */
interface InventoryGroupListResponse {
  data: InventoryGroup[]
  total: number
  page: number
  limit: number
}

/** Thrown when a name collides with an existing record (HTTP 409). */
export class DuplicateInventoryGroupNameError extends Error {
  constructor(name: string) {
    super(`An inventory group named "${name}" already exists.`)
    this.name = "DuplicateInventoryGroupNameError"
  }
}

/** Generic API error carrying the backend's message + status code. */
export class InventoryGroupApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "InventoryGroupApiError"
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
      throw new DuplicateInventoryGroupNameError(message)
    }
    throw new InventoryGroupApiError(message, response.status)
  }

  return (await response.json()) as T
}

/** Drop empty/whitespace-only remark so the backend stores null, not "". */
function toPayload(
  input: CreateInventoryGroupInput | UpdateInventoryGroupInput,
) {
  const remark = input.remark?.trim()
  return {
    name: input.name.trim(),
    remark: remark ? remark : null,
    status: input.status,
  }
}

export async function listInventoryGroups(): Promise<InventoryGroup[]> {
  // The list screen filters/paginates client-side, so fetch the full set.
  // `no-store` keeps the data fresh when this runs in a Server Component.
  const result = await request<InventoryGroupListResponse>(
    `${BASE_URL}?limit=1000`,
    { cache: "no-store" },
  )
  return result.data
}

export async function getInventoryGroup(
  id: number,
): Promise<InventoryGroup | undefined> {
  try {
    return await request<InventoryGroup>(`${BASE_URL}/${id}`, {
      cache: "no-store",
    })
  } catch (error) {
    if (error instanceof InventoryGroupApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createInventoryGroup(
  input: CreateInventoryGroupInput,
): Promise<InventoryGroup> {
  return request<InventoryGroup>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateInventoryGroup(
  id: number,
  input: UpdateInventoryGroupInput,
): Promise<InventoryGroup> {
  return request<InventoryGroup>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteInventoryGroup(id: number): Promise<void> {
  await request<InventoryGroup>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
