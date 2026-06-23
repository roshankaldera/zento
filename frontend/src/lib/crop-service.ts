/**
 * Crop data service — HTTP client for the NestJS Crop CRUD API.
 *
 * Every function returns the same shapes the in-app screens already consume
 * (list / form / edit), so wiring the real backend required **no changes at the
 * call sites**. The base URL comes from `NEXT_PUBLIC_API_URL`.
 *
 * Backend contract:
 *   POST   /crops            { name, remark?, status? }      -> Crop
 *   GET    /crops            ?page&limit&search&status        -> { data, total, page, limit }
 *   GET    /crops/:id                                         -> Crop
 *   PATCH  /crops/:id        partial { name, remark, status } -> Crop
 *   DELETE /crops/:id                                         -> Crop
 */

import type {
  CreateCropInput,
  Crop,
  UpdateCropInput,
} from "@/types/crop"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const CROPS_URL = `${API_BASE}/crops`

/** Shape returned by the list endpoint. */
interface CropListResponse {
  data: Crop[]
  total: number
  page: number
  limit: number
}

/** Thrown when a crop name collides with an existing record (HTTP 409). */
export class DuplicateCropNameError extends Error {
  constructor(name: string) {
    super(`A crop named "${name}" already exists.`)
    this.name = "DuplicateCropNameError"
  }
}

/** Generic API error carrying the backend's message + status code. */
export class CropApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "CropApiError"
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
      throw new DuplicateCropNameError(message)
    }
    throw new CropApiError(message, response.status)
  }

  return (await response.json()) as T
}

/** Drop empty/whitespace-only remark so the backend stores null, not "". */
function toPayload(input: CreateCropInput | UpdateCropInput) {
  const remark = input.remark?.trim()
  return {
    name: input.name.trim(),
    remark: remark ? remark : null,
    status: input.status,
  }
}

export async function listCrops(): Promise<Crop[]> {
  // The list screen filters/paginates client-side, so fetch the full set.
  // `no-store` keeps the data fresh when this runs in a Server Component (the
  // page re-fetches on every `router.refresh()` after a mutation).
  const result = await request<CropListResponse>(`${CROPS_URL}?limit=1000`, {
    cache: "no-store",
  })
  return result.data
}

export async function getCrop(id: number): Promise<Crop | undefined> {
  try {
    return await request<Crop>(`${CROPS_URL}/${id}`, { cache: "no-store" })
  } catch (error) {
    if (error instanceof CropApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createCrop(input: CreateCropInput): Promise<Crop> {
  return request<Crop>(CROPS_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateCrop(
  id: number,
  input: UpdateCropInput,
): Promise<Crop> {
  return request<Crop>(`${CROPS_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteCrop(id: number): Promise<void> {
  await request<Crop>(`${CROPS_URL}/${id}`, { method: "DELETE" })
}
