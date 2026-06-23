import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
} from "@/types/account"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/accounts`

interface AccountListResponse {
  data: Account[]
  total: number
  page: number
  limit: number
}

/** Thrown on a 409 — a duplicate code or name (message says which). */
export class DuplicateAccountError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DuplicateAccountError"
  }
}

export class AccountApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "AccountApiError"
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
      throw new DuplicateAccountError(message)
    }
    throw new AccountApiError(message, response.status)
  }

  return (await response.json()) as T
}

function toPayload(input: CreateAccountInput | UpdateAccountInput) {
  return {
    businessId: input.businessId,
    code: input.code.trim(),
    name: input.name.trim(),
    groupId: input.groupId,
    status: input.status,
  }
}

export async function listAccounts(): Promise<Account[]> {
  const result = await request<AccountListResponse>(`${BASE_URL}?limit=1000`, {
    cache: "no-store",
  })
  return result.data
}

export async function getAccount(id: number): Promise<Account | undefined> {
  try {
    return await request<Account>(`${BASE_URL}/${id}`, { cache: "no-store" })
  } catch (error) {
    if (error instanceof AccountApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createAccount(input: CreateAccountInput): Promise<Account> {
  return request<Account>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateAccount(
  id: number,
  input: UpdateAccountInput,
): Promise<Account> {
  return request<Account>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteAccount(id: number): Promise<void> {
  await request<Account>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
