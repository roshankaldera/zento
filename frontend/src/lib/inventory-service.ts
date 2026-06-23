import type {
  CreateInventoryInput,
  Inventory,
  UpdateInventoryInput,
} from "@/types/inventory"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/inventories`

interface InventoryListResponse {
  data: Inventory[]
  total: number
  page: number
  limit: number
}

/** Thrown when the name collides with an existing record (HTTP 409). */
export class DuplicateInventoryNameError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DuplicateInventoryNameError"
  }
}

export class InventoryApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "InventoryApiError"
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
      throw new DuplicateInventoryNameError(message)
    }
    throw new InventoryApiError(message, response.status)
  }

  return (await response.json()) as T
}

function toPayload(input: CreateInventoryInput | UpdateInventoryInput) {
  return {
    applicableBusinesses: input.applicableBusinesses,
    name: input.name.trim(),
    uom: input.uom,
    status: input.status,
    lines: input.lines.map((line) => ({
      businessId: line.businessId,
      quantity: line.quantity,
      avgCost: line.avgCost,
    })),
  }
}

export async function listInventories(): Promise<Inventory[]> {
  const result = await request<InventoryListResponse>(`${BASE_URL}?limit=1000`, {
    cache: "no-store",
  })
  return result.data
}

export async function getInventory(id: number): Promise<Inventory | undefined> {
  try {
    return await request<Inventory>(`${BASE_URL}/${id}`, { cache: "no-store" })
  } catch (error) {
    if (error instanceof InventoryApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createInventory(
  input: CreateInventoryInput,
): Promise<Inventory> {
  return request<Inventory>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateInventory(
  id: number,
  input: UpdateInventoryInput,
): Promise<Inventory> {
  return request<Inventory>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteInventory(id: number): Promise<void> {
  await request<Inventory>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
