import type {
  CreateJournalInput,
  Journal,
  UpdateJournalInput,
} from "@/types/journal"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/journals`

interface JournalListResponse {
  data: Journal[]
  total: number
  page: number
  limit: number
}

/** Thrown on a 409 (no unique field today, kept for parity / future use). */
export class DuplicateJournalError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DuplicateJournalError"
  }
}

export class JournalApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "JournalApiError"
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
      throw new DuplicateJournalError(message)
    }
    throw new JournalApiError(message, response.status)
  }

  return (await response.json()) as T
}

/** Trim header strings, coerce optionals to null, and normalise the lines. */
function toPayload(input: CreateJournalInput | UpdateJournalInput) {
  const remark = input.remark?.trim()
  return {
    businessId: input.businessId,
    bankId: input.bankId,
    category: input.category,
    date: input.date,
    remark: remark ? remark : null,
    postBy: input.postBy,
    status: input.status,
    // `total_value` and `post_time` are intentionally omitted — server-managed.
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

export async function listJournals(): Promise<Journal[]> {
  const result = await request<JournalListResponse>(`${BASE_URL}?limit=1000`, {
    cache: "no-store",
  })
  return result.data
}

export async function getJournal(id: number): Promise<Journal | undefined> {
  try {
    return await request<Journal>(`${BASE_URL}/${id}`, { cache: "no-store" })
  } catch (error) {
    if (error instanceof JournalApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createJournal(input: CreateJournalInput): Promise<Journal> {
  return request<Journal>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateJournal(
  id: number,
  input: UpdateJournalInput,
): Promise<Journal> {
  return request<Journal>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteJournal(id: number): Promise<void> {
  await request<Journal>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
