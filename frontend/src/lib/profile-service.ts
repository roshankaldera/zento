import type { User } from "@/types/user"
import { getToken } from "./auth-service"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/auth`

export interface UpdateProfileInput {
  fullName: string
  remark?: string | null
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

/** Thrown when the session token is missing/expired (HTTP 401). */
export class UnauthenticatedError extends Error {
  constructor(message = "Your session has expired. Please sign in again.") {
    super(message)
    this.name = "UnauthenticatedError"
  }
}

/** Thrown when the supplied current password is wrong (HTTP 400). */
export class IncorrectPasswordError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "IncorrectPasswordError"
  }
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] }
    if (Array.isArray(body.message)) return body.message.join(", ")
    if (body.message) return body.message
  } catch {
    // fall through
  }
  return response.statusText || "Request failed"
}

/** Load the signed-in user's profile. */
export async function getProfile(): Promise<User> {
  const response = await fetch(`${BASE_URL}/me`, { headers: authHeaders() })
  if (!response.ok) {
    if (response.status === 401) throw new UnauthenticatedError()
    throw new Error(await readError(response))
  }
  return (await response.json()) as User
}

/** Update the signed-in user's name/remark; returns the updated user. */
export async function updateProfile(
  input: UpdateProfileInput,
): Promise<User> {
  const response = await fetch(`${BASE_URL}/profile`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({
      fullName: input.fullName.trim(),
      remark: input.remark?.trim() ? input.remark.trim() : null,
    }),
  })
  if (!response.ok) {
    if (response.status === 401) throw new UnauthenticatedError()
    throw new Error(await readError(response))
  }
  return (await response.json()) as User
}

/** Change the signed-in user's password. */
export async function changePassword(
  input: ChangePasswordInput,
): Promise<void> {
  const response = await fetch(`${BASE_URL}/password`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    const message = await readError(response)
    if (response.status === 401) throw new UnauthenticatedError()
    if (response.status === 400) throw new IncorrectPasswordError(message)
    throw new Error(message)
  }
}
