import type { CreateKotInput, Kot, UpdateKotInput } from "@/types/kot"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/kots`

interface KotListResponse {
  data: Kot[]
  total: number
  page: number
  limit: number
}

export class KotApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "KotApiError"
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
    throw new KotApiError(message, response.status)
  }

  return (await response.json()) as T
}

function toPayload(input: CreateKotInput | UpdateKotInput) {
  const remark = input.remark?.trim()
  return {
    businessId: input.businessId,
    bookingId: input.bookingId,
    requestTime: input.requestTime,
    remark: remark ? remark : null,
    lines: input.lines.map((line) => {
      const lineRemark = line.remark?.trim()
      return {
        item: line.item.trim(),
        quantity: line.quantity,
        remark: lineRemark ? lineRemark : null,
      }
    }),
  }
}

export async function listKots(): Promise<Kot[]> {
  const result = await request<KotListResponse>(`${BASE_URL}?limit=1000`, {
    cache: "no-store",
  })
  return result.data
}

export async function getKot(id: number): Promise<Kot | undefined> {
  try {
    return await request<Kot>(`${BASE_URL}/${id}`, { cache: "no-store" })
  } catch (error) {
    if (error instanceof KotApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createKot(input: CreateKotInput): Promise<Kot> {
  return request<Kot>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateKot(id: number, input: UpdateKotInput): Promise<Kot> {
  return request<Kot>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteKot(id: number): Promise<void> {
  await request<Kot>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
