import type {
  CreateLatexHarvestInput,
  LatexHarvest,
  UpdateLatexHarvestInput,
} from "@/types/latex-harvest"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/latex-harvests`

interface LatexHarvestListResponse {
  data: LatexHarvest[]
  total: number
  page: number
  limit: number
}

/** Thrown on a 409 — a duplicate (estate + date). */
export class DuplicateLatexHarvestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DuplicateLatexHarvestError"
  }
}

export class LatexHarvestApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "LatexHarvestApiError"
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
      throw new DuplicateLatexHarvestError(message)
    }
    throw new LatexHarvestApiError(message, response.status)
  }

  return (await response.json()) as T
}

function toPayload(input: CreateLatexHarvestInput | UpdateLatexHarvestInput) {
  const remark = input.remark?.trim()
  return {
    estateId: input.estateId,
    date: input.date,
    rainfall: input.rainfall ?? null,
    remark: remark ? remark : null,
    lines: input.lines.map((line) => ({
      employeeId: line.employeeId,
      liter: line.liter,
      ottapalu: line.ottapalu,
      status: line.status,
    })),
  }
}

export async function listLatexHarvests(): Promise<LatexHarvest[]> {
  const result = await request<LatexHarvestListResponse>(
    `${BASE_URL}?limit=1000`,
    { cache: "no-store" },
  )
  return result.data
}

export async function getLatexHarvest(
  id: number,
): Promise<LatexHarvest | undefined> {
  try {
    return await request<LatexHarvest>(`${BASE_URL}/${id}`, {
      cache: "no-store",
    })
  } catch (error) {
    if (error instanceof LatexHarvestApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createLatexHarvest(
  input: CreateLatexHarvestInput,
): Promise<LatexHarvest> {
  return request<LatexHarvest>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateLatexHarvest(
  id: number,
  input: UpdateLatexHarvestInput,
): Promise<LatexHarvest> {
  return request<LatexHarvest>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteLatexHarvest(id: number): Promise<void> {
  await request<LatexHarvest>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
