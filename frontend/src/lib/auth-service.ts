import type { User } from "@/types/user"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

/** Cookie read by middleware.ts to gate routes; mirrored to localStorage. */
export const TOKEN_COOKIE = "zento_token"
const USER_STORAGE_KEY = "zento_user"

export interface LoginResult {
  accessToken: string
  /** Token lifetime in seconds. */
  expiresIn: number
  user: User
}

/** Thrown for a 401 (bad credentials / inactive account). */
export class InvalidCredentialsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidCredentialsError"
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

/** Authenticate by user name + password, persisting the session on success. */
export async function login(
  userName: string,
  password: string,
  rememberMe = false,
): Promise<LoginResult> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName, password, rememberMe }),
  })

  if (!response.ok) {
    const message = await readError(response)
    if (response.status === 401) {
      throw new InvalidCredentialsError(message)
    }
    throw new Error(message)
  }

  const result = (await response.json()) as LoginResult
  storeSession(result)
  return result
}

function storeSession(result: LoginResult) {
  if (typeof document !== "undefined") {
    document.cookie = `${TOKEN_COOKIE}=${result.accessToken}; path=/; max-age=${result.expiresIn}; samesite=lax`
  }
  if (typeof window !== "undefined") {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user))
    window.localStorage.setItem(TOKEN_COOKIE, result.accessToken)
  }
}

/** Clear the cookie and stored user/token. */
export function logout() {
  if (typeof document !== "undefined") {
    document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; samesite=lax`
  }
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(USER_STORAGE_KEY)
    window.localStorage.removeItem(TOKEN_COOKIE)
  }
}

/** Overwrite the persisted user (e.g. after a profile update). */
export function setStoredUser(user: User) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  }
}

/** The user persisted at login (client-side only), or null. */
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(USER_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

/** The bearer token, for authenticated API calls. */
export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_COOKIE)
}
