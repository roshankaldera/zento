import type {
  CreateEmployeeLoanInput,
  EmployeeLoan,
  UpdateEmployeeLoanInput,
} from "@/types/employee-loan"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/employee-loans`

interface EmployeeLoanListResponse {
  data: EmployeeLoan[]
  total: number
  page: number
  limit: number
}

export class EmployeeLoanApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "EmployeeLoanApiError"
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
    throw new EmployeeLoanApiError(message, response.status)
  }

  return (await response.json()) as T
}

function toPayload(input: CreateEmployeeLoanInput | UpdateEmployeeLoanInput) {
  return {
    employeeId: input.employeeId,
    issueDate: input.issueDate ?? null,
    value: input.value,
    installment: input.installment,
    dueDay: input.dueDay,
    balance: input.balance,
    status: input.status,
  }
}

export async function listEmployeeLoans(): Promise<EmployeeLoan[]> {
  const result = await request<EmployeeLoanListResponse>(
    `${BASE_URL}?limit=1000`,
    { cache: "no-store" },
  )
  return result.data
}

export async function getEmployeeLoan(
  id: number,
): Promise<EmployeeLoan | undefined> {
  try {
    return await request<EmployeeLoan>(`${BASE_URL}/${id}`, {
      cache: "no-store",
    })
  } catch (error) {
    if (error instanceof EmployeeLoanApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createEmployeeLoan(
  input: CreateEmployeeLoanInput,
): Promise<EmployeeLoan> {
  return request<EmployeeLoan>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateEmployeeLoan(
  id: number,
  input: UpdateEmployeeLoanInput,
): Promise<EmployeeLoan> {
  return request<EmployeeLoan>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteEmployeeLoan(id: number): Promise<void> {
  await request<EmployeeLoan>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
