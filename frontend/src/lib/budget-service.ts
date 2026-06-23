import type {
  Budget,
  BudgetMonth,
  CreateBudgetInput,
  UpdateBudgetInput,
} from "@/types/budget"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/budgets`

interface BudgetListResponse {
  data: Budget[]
  total: number
  page: number
  limit: number
}

const MONTHS: BudgetMonth[] = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
]

/** Thrown on a 409 — a duplicate (business + year). */
export class DuplicateBudgetError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DuplicateBudgetError"
  }
}

export class BudgetApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "BudgetApiError"
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
      throw new DuplicateBudgetError(message)
    }
    throw new BudgetApiError(message, response.status)
  }

  return (await response.json()) as T
}

/** Trim header strings and normalise the lines (drop empty rows defensively). */
function toPayload(input: CreateBudgetInput | UpdateBudgetInput) {
  return {
    businessId: input.businessId,
    year: input.year,
    lines: input.lines
      .filter((line) => Number.isFinite(line.accountId) && line.accountId > 0)
      .map((line) => {
        const description = line.description?.trim()
        const months = Object.fromEntries(
          MONTHS.map((m) => [m, Number(line[m]) || 0]),
        ) as Record<BudgetMonth, number>
        return {
          accountId: line.accountId,
          description: description ? description : null,
          ...months,
        }
      }),
  }
}

export async function listBudgets(): Promise<Budget[]> {
  const result = await request<BudgetListResponse>(`${BASE_URL}?limit=1000`, {
    cache: "no-store",
  })
  return result.data
}

export async function getBudget(id: number): Promise<Budget | undefined> {
  try {
    return await request<Budget>(`${BASE_URL}/${id}`, { cache: "no-store" })
  } catch (error) {
    if (error instanceof BudgetApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createBudget(input: CreateBudgetInput): Promise<Budget> {
  return request<Budget>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateBudget(
  id: number,
  input: UpdateBudgetInput,
): Promise<Budget> {
  return request<Budget>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteBudget(id: number): Promise<void> {
  await request<Budget>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
