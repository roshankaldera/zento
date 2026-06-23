/**
 * Journal Category data service — HTTP client for the NestJS CRUD API.
 *
 * Every function returns the same shapes the in-app screens consume (list / form
 * / edit). The base URL comes from `NEXT_PUBLIC_API_URL`.
 *
 * Backend contract:
 *   POST   /journal-categories            { name, remark?, status? }      -> JournalCategory
 *   GET    /journal-categories            ?page&limit&search&status        -> { data, total, page, limit }
 *   GET    /journal-categories/:id                                         -> JournalCategory
 *   PATCH  /journal-categories/:id        partial { name, remark, status } -> JournalCategory
 *   DELETE /journal-categories/:id                                         -> JournalCategory
 */

import type {
  JournalCategory,
  CreateJournalCategoryInput,
  UpdateJournalCategoryInput,
} from "@/types/journal-category"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/journal-categories`

/** Shape returned by the list endpoint. */
interface JournalCategoryListResponse {
  data: JournalCategory[]
  total: number
  page: number
  limit: number
}

/** Thrown when a name collides with an existing record (HTTP 409). */
export class DuplicateJournalCategoryNameError extends Error {
  constructor(name: string) {
    super(`A journal category named "${name}" already exists.`)
    this.name = "DuplicateJournalCategoryNameError"
  }
}

/** Generic API error carrying the backend's message + status code. */
export class JournalCategoryApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "JournalCategoryApiError"
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
      throw new DuplicateJournalCategoryNameError(message)
    }
    throw new JournalCategoryApiError(message, response.status)
  }

  return (await response.json()) as T
}

/** Drop empty/whitespace-only remark so the backend stores null, not "". */
function toPayload(
  input: CreateJournalCategoryInput | UpdateJournalCategoryInput,
) {
  const remark = input.remark?.trim()
  return {
    name: input.name.trim(),
    remark: remark ? remark : null,
    status: input.status,
  }
}

export async function listJournalCategories(): Promise<JournalCategory[]> {
  // The list screen filters/paginates client-side, so fetch the full set.
  // `no-store` keeps the data fresh when this runs in a Server Component.
  const result = await request<JournalCategoryListResponse>(
    `${BASE_URL}?limit=1000`,
    { cache: "no-store" },
  )
  return result.data
}

export async function getJournalCategory(
  id: number,
): Promise<JournalCategory | undefined> {
  try {
    return await request<JournalCategory>(`${BASE_URL}/${id}`, {
      cache: "no-store",
    })
  } catch (error) {
    if (error instanceof JournalCategoryApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createJournalCategory(
  input: CreateJournalCategoryInput,
): Promise<JournalCategory> {
  return request<JournalCategory>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateJournalCategory(
  id: number,
  input: UpdateJournalCategoryInput,
): Promise<JournalCategory> {
  return request<JournalCategory>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteJournalCategory(id: number): Promise<void> {
  await request<JournalCategory>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
