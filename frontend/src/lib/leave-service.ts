import type {
  CreateLeaveInput,
  Leave,
  UpdateLeaveInput,
} from "@/types/leave"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/leaves`

interface LeaveListResponse {
  data: Leave[]
  total: number
  page: number
  limit: number
}

/** Thrown on a 409 — a duplicate (employee + date). */
export class DuplicateLeaveError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DuplicateLeaveError"
  }
}

export class LeaveApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "LeaveApiError"
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
      throw new DuplicateLeaveError(message)
    }
    throw new LeaveApiError(message, response.status)
  }

  return (await response.json()) as T
}

function toPayload(input: CreateLeaveInput | UpdateLeaveInput) {
  const reason = input.reason?.trim()
  return {
    date: input.date,
    employeeId: input.employeeId,
    period: input.period,
    reason: reason ? reason : null,
  }
}

export async function listLeaves(): Promise<Leave[]> {
  const result = await request<LeaveListResponse>(`${BASE_URL}?limit=1000`, {
    cache: "no-store",
  })
  return result.data
}

export async function getLeave(id: number): Promise<Leave | undefined> {
  try {
    return await request<Leave>(`${BASE_URL}/${id}`, { cache: "no-store" })
  } catch (error) {
    if (error instanceof LeaveApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createLeave(input: CreateLeaveInput): Promise<Leave> {
  return request<Leave>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateLeave(
  id: number,
  input: UpdateLeaveInput,
): Promise<Leave> {
  return request<Leave>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteLeave(id: number): Promise<void> {
  await request<Leave>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
