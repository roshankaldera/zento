/**
 * Account Category data service — HTTP client for the NestJS CRUD API.
 *
 * Every function returns the same shapes the in-app screens consume (list / form
 * / edit). The base URL comes from `NEXT_PUBLIC_API_URL`.
 *
 * Backend contract:
 *   POST   /account-categories            { name, remark?, status? }      -> AccountCategory
 *   GET    /account-categories            ?page&limit&search&status        -> { data, total, page, limit }
 *   GET    /account-categories/:id                                         -> AccountCategory
 *   PATCH  /account-categories/:id        partial { name, remark, status } -> AccountCategory
 *   DELETE /account-categories/:id                                         -> AccountCategory
 */

import type {
  AccountCategory,
  CreateAccountCategoryInput,
  UpdateAccountCategoryInput,
} from "@/types/account-category"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/account-categories`

/** Shape returned by the list endpoint. */
interface AccountCategoryListResponse {
  data: AccountCategory[]
  total: number
  page: number
  limit: number
}

/** Thrown when a name collides with an existing record (HTTP 409). */
export class DuplicateAccountCategoryNameError extends Error {
  constructor(name: string) {
    super(`An account category named "${name}" already exists.`)
    this.name = "DuplicateAccountCategoryNameError"
  }
}

/** Generic API error carrying the backend's message + status code. */
export class AccountCategoryApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "AccountCategoryApiError"
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
      throw new DuplicateAccountCategoryNameError(message)
    }
    throw new AccountCategoryApiError(message, response.status)
  }

  return (await response.json()) as T
}

/** Drop empty/whitespace-only remark so the backend stores null, not "". */
function toPayload(
  input: CreateAccountCategoryInput | UpdateAccountCategoryInput,
) {
  const remark = input.remark?.trim()
  return {
    name: input.name.trim(),
    remark: remark ? remark : null,
    status: input.status,
  }
}

export async function listAccountCategories(): Promise<AccountCategory[]> {
  // The list screen filters/paginates client-side, so fetch the full set.
  // `no-store` keeps the data fresh when this runs in a Server Component.
  const result = await request<AccountCategoryListResponse>(
    `${BASE_URL}?limit=1000`,
    { cache: "no-store" },
  )
  return result.data
}

export async function getAccountCategory(
  id: number,
): Promise<AccountCategory | undefined> {
  try {
    return await request<AccountCategory>(`${BASE_URL}/${id}`, {
      cache: "no-store",
    })
  } catch (error) {
    if (error instanceof AccountCategoryApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createAccountCategory(
  input: CreateAccountCategoryInput,
): Promise<AccountCategory> {
  return request<AccountCategory>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateAccountCategory(
  id: number,
  input: UpdateAccountCategoryInput,
): Promise<AccountCategory> {
  return request<AccountCategory>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteAccountCategory(id: number): Promise<void> {
  await request<AccountCategory>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
