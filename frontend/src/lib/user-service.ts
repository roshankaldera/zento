import type { CreateUserInput, User, UpdateUserInput } from "@/types/user"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/users`

interface UserListResponse {
  data: User[]
  total: number
  page: number
  limit: number
}

/** Thrown when the user name collides with an existing record (HTTP 409). */
export class DuplicateUserNameError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DuplicateUserNameError"
  }
}

export class UserApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "UserApiError"
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
      throw new DuplicateUserNameError(message)
    }
    throw new UserApiError(message, response.status)
  }

  return (await response.json()) as T
}

function toPayload(input: CreateUserInput | UpdateUserInput) {
  const remark = input.remark?.trim()
  const password = input.password?.trim()
  return {
    fullName: input.fullName.trim(),
    userName: input.userName.trim(),
    // Only send the password when one was entered (blank = keep current).
    ...(password ? { password } : {}),
    defaultBusiness: input.defaultBusiness ?? null,
    accessibleBusinesses: input.accessibleBusinesses,
    status: input.status,
    remark: remark ? remark : null,
  }
}

export async function listUsers(): Promise<User[]> {
  const result = await request<UserListResponse>(`${BASE_URL}?limit=1000`, {
    cache: "no-store",
  })
  return result.data
}

export async function getUser(id: number): Promise<User | undefined> {
  try {
    return await request<User>(`${BASE_URL}/${id}`, { cache: "no-store" })
  } catch (error) {
    if (error instanceof UserApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createUser(input: CreateUserInput): Promise<User> {
  return request<User>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateUser(
  id: number,
  input: UpdateUserInput,
): Promise<User> {
  return request<User>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteUser(id: number): Promise<void> {
  await request<User>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
