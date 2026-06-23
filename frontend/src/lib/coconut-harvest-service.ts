import type {
  CoconutHarvest,
  CreateCoconutHarvestInput,
  UpdateCoconutHarvestInput,
} from "@/types/coconut-harvest"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/coconut-harvests`

interface CoconutHarvestListResponse {
  data: CoconutHarvest[]
  total: number
  page: number
  limit: number
}

/** Thrown on a 409 — a duplicate (estate + date). */
export class DuplicateCoconutHarvestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DuplicateCoconutHarvestError"
  }
}

export class CoconutHarvestApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "CoconutHarvestApiError"
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
      throw new DuplicateCoconutHarvestError(message)
    }
    throw new CoconutHarvestApiError(message, response.status)
  }

  return (await response.json()) as T
}

function toPayload(input: CreateCoconutHarvestInput | UpdateCoconutHarvestInput) {
  const remark = input.remark?.trim()
  return {
    estateId: input.estateId,
    date: input.date,
    remark: remark ? remark : null,
    lines: input.lines.map((line) => ({
      divisionId: line.divisionId,
      quantity: line.quantity,
    })),
  }
}

export async function listCoconutHarvests(): Promise<CoconutHarvest[]> {
  const result = await request<CoconutHarvestListResponse>(
    `${BASE_URL}?limit=1000`,
    { cache: "no-store" },
  )
  return result.data
}

export async function getCoconutHarvest(
  id: number,
): Promise<CoconutHarvest | undefined> {
  try {
    return await request<CoconutHarvest>(`${BASE_URL}/${id}`, {
      cache: "no-store",
    })
  } catch (error) {
    if (error instanceof CoconutHarvestApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createCoconutHarvest(
  input: CreateCoconutHarvestInput,
): Promise<CoconutHarvest> {
  return request<CoconutHarvest>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateCoconutHarvest(
  id: number,
  input: UpdateCoconutHarvestInput,
): Promise<CoconutHarvest> {
  return request<CoconutHarvest>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteCoconutHarvest(id: number): Promise<void> {
  await request<CoconutHarvest>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
