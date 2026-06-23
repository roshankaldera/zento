import type {
  CreateRecurringInput,
  Recurring,
  UpdateRecurringInput,
} from "@/types/recurring"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/recurrings`

interface RecurringListResponse {
  data: Recurring[]
  total: number
  page: number
  limit: number
}

/** Thrown on a 409 (no unique field today, kept for parity / future use). */
export class DuplicateRecurringError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DuplicateRecurringError"
  }
}

export class RecurringApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "RecurringApiError"
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
      throw new DuplicateRecurringError(message)
    }
    throw new RecurringApiError(message, response.status)
  }

  return (await response.json()) as T
}

/** Trim header strings, coerce optionals to null, and normalise the lines. */
function toPayload(input: CreateRecurringInput | UpdateRecurringInput) {
  const remark = input.remark?.trim()
  return {
    businessId: input.businessId,
    bankId: input.bankId,
    category: input.category,
    recurringDay: input.recurringDay,
    fromPeriod: input.fromPeriod ? input.fromPeriod : null,
    toPeriod: input.toPeriod ? input.toPeriod : null,
    status: input.status,
    remark: remark ? remark : null,
    lines: input.lines
      .filter((line) => Number.isFinite(line.accountId) && line.accountId > 0)
      .map((line) => {
        const description = line.description?.trim()
        const reference = line.reference?.trim()
        return {
          accountId: line.accountId,
          type: line.type,
          description: description ? description : null,
          reference: reference ? reference : null,
          assetId: line.assetId ?? null,
          empId: line.empId ?? null,
          supplierId: line.supplierId ?? null,
          value: line.value,
        }
      }),
  }
}

export async function listRecurrings(): Promise<Recurring[]> {
  const result = await request<RecurringListResponse>(`${BASE_URL}?limit=1000`, {
    cache: "no-store",
  })
  return result.data
}

export async function getRecurring(id: number): Promise<Recurring | undefined> {
  try {
    return await request<Recurring>(`${BASE_URL}/${id}`, { cache: "no-store" })
  } catch (error) {
    if (error instanceof RecurringApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createRecurring(
  input: CreateRecurringInput,
): Promise<Recurring> {
  return request<Recurring>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateRecurring(
  id: number,
  input: UpdateRecurringInput,
): Promise<Recurring> {
  return request<Recurring>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteRecurring(id: number): Promise<void> {
  await request<Recurring>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
