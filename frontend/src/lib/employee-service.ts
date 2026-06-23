/**
 * Employee data service — HTTP client for the NestJS CRUD API.
 *
 * Every function returns the same shapes the in-app screens consume (list / form
 * / edit). The base URL comes from `NEXT_PUBLIC_API_URL`.
 *
 * Backend contract:
 *   POST   /employees            { businessId, empNo, nic, name, mobile1?, mobile2?, address?, dob?, attendType, status? } -> Employee
 *   GET    /employees            ?page&limit&search&status   -> { data, total, page, limit }
 *   GET    /employees/:id                                    -> Employee
 *   PATCH  /employees/:id        partial { ... }             -> Employee
 *   DELETE /employees/:id                                    -> Employee
 */

import type {
  CreateEmployeeInput,
  Employee,
  UpdateEmployeeInput,
} from "@/types/employee"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/employees`

/** Shape returned by the list endpoint. */
interface EmployeeListResponse {
  data: Employee[]
  total: number
  page: number
  limit: number
}

/**
 * Thrown when a unique field collides (HTTP 409). Carries the backend message so
 * the form can decide whether it was `empNo` or `nic`.
 */
export class DuplicateEmployeeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DuplicateEmployeeError"
  }
}

/** Generic API error carrying the backend's message + status code. */
export class EmployeeApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "EmployeeApiError"
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
      throw new DuplicateEmployeeError(message)
    }
    throw new EmployeeApiError(message, response.status)
  }

  return (await response.json()) as T
}

/** Trim strings; empty optional text -> null so the backend stores null, not "". */
function toPayload(input: CreateEmployeeInput | UpdateEmployeeInput) {
  const clean = (v?: string | null) => {
    const t = v?.trim()
    return t ? t : null
  }
  return {
    businessId: input.businessId,
    empNo: input.empNo.trim(),
    nic: input.nic.trim(),
    name: input.name.trim(),
    mobile1: clean(input.mobile1),
    mobile2: clean(input.mobile2),
    address: clean(input.address),
    dob: input.dob ?? null,
    attendType: input.attendType,
    status: input.status,
  }
}

export async function listEmployees(): Promise<Employee[]> {
  // The list screen filters/paginates client-side, so fetch the full set.
  // `no-store` keeps the data fresh when this runs in a Server Component.
  const result = await request<EmployeeListResponse>(`${BASE_URL}?limit=1000`, {
    cache: "no-store",
  })
  return result.data
}

export async function getEmployee(id: number): Promise<Employee | undefined> {
  try {
    return await request<Employee>(`${BASE_URL}/${id}`, { cache: "no-store" })
  } catch (error) {
    if (error instanceof EmployeeApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createEmployee(
  input: CreateEmployeeInput,
): Promise<Employee> {
  return request<Employee>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateEmployee(
  id: number,
  input: UpdateEmployeeInput,
): Promise<Employee> {
  return request<Employee>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteEmployee(id: number): Promise<void> {
  await request<Employee>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
