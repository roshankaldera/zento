import { getInventory, listInventories } from "@/lib/inventory-service"
import type {
  CreateItemTransactionInput,
  ItemTransaction,
  UpdateItemTransactionInput,
} from "@/types/item-transaction"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/item-transactions`

interface ItemTransactionListResponse {
  data: ItemTransaction[]
  total: number
  page: number
  limit: number
}

/** Thrown on a 409 (no unique field today, kept for parity / future use). */
export class DuplicateItemTransactionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DuplicateItemTransactionError"
  }
}

export class ItemTransactionApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "ItemTransactionApiError"
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
      throw new DuplicateItemTransactionError(message)
    }
    throw new ItemTransactionApiError(message, response.status)
  }

  return (await response.json()) as T
}

/** Trim header strings, coerce optionals to null, and normalise the lines. */
function toPayload(
  input: CreateItemTransactionInput | UpdateItemTransactionInput,
) {
  const remark = input.remark?.trim()
  return {
    businessId: input.businessId,
    date: input.date,
    requestBy: input.requestBy ?? null,
    type: input.type,
    remark: remark ? remark : null,
    // `total` is intentionally omitted — recomputed server-side.
    lines: input.lines
      .filter((line) => Number.isFinite(line.itemId) && line.itemId > 0)
      .map((line) => {
        const description = line.description?.trim()
        return {
          itemId: line.itemId,
          description: description ? description : null,
          quantity: line.quantity,
          price: line.price,
        }
      }),
  }
}

export async function listItemTransactions(): Promise<ItemTransaction[]> {
  const result = await request<ItemTransactionListResponse>(
    `${BASE_URL}?limit=1000`,
    { cache: "no-store" },
  )
  return result.data
}

export async function getItemTransaction(
  id: number,
): Promise<ItemTransaction | undefined> {
  try {
    return await request<ItemTransaction>(`${BASE_URL}/${id}`, {
      cache: "no-store",
    })
  } catch (error) {
    if (error instanceof ItemTransactionApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createItemTransaction(
  input: CreateItemTransactionInput,
): Promise<ItemTransaction> {
  return request<ItemTransaction>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateItemTransaction(
  id: number,
  input: UpdateItemTransactionInput,
): Promise<ItemTransaction> {
  return request<ItemTransaction>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteItemTransaction(id: number): Promise<void> {
  await request<ItemTransaction>(`${BASE_URL}/${id}`, { method: "DELETE" })
}

// ---------------------------------------------------------------------------
// Item (inventory) support data for the line editor.
//
// The transaction lines need, per item: which businesses it applies to (to
// filter the dropdown by the selected header business) and the per-business
// stock (available quantity + cost) — used to display the available quantity
// and to auto-load the line price when an item is picked.
// ---------------------------------------------------------------------------

export interface ItemStock {
  businessId: number
  quantity: number
  avgCost: number
}

export interface ItemWithStock {
  id: number
  name: string
  applicableBusinesses: number[]
  stock: ItemStock[]
}

/**
 * Load every active inventory item together with its per-business stock. The
 * inventory list endpoint only returns a line count, so each item's stock is
 * fetched via its detail endpoint (acceptable for an internal master list).
 */
export async function listItemsWithStock(): Promise<ItemWithStock[]> {
  const inventories = await listInventories()
  const active = inventories.filter((inv) => inv.status === 1)
  const details = await Promise.all(
    active.map((inv) => getInventory(inv.id).catch(() => undefined)),
  )
  return details.filter((inv): inv is NonNullable<typeof inv> => Boolean(inv)).map(
    (inv) => ({
      id: inv.id,
      name: inv.name,
      applicableBusinesses: inv.applicableBusinesses,
      stock: (inv.lines ?? []).map((line) => ({
        businessId: line.businessId,
        quantity: Number(line.quantity),
        avgCost: Number(line.avgCost),
      })),
    }),
  )
}
