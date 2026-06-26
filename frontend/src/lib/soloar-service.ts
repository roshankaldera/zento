import type {
  CreateSoloarInput,
  Soloar,
  UpdateSoloarInput,
} from "@/types/soloar"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/soloars`

interface SoloarListResponse {
  data: Soloar[]
  total: number
  page: number
  limit: number
}

export class SoloarApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "SoloarApiError"
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
    throw new SoloarApiError(message, response.status)
  }

  return (await response.json()) as T
}

function toPayload(input: CreateSoloarInput | UpdateSoloarInput) {
  return {
    businessId: input.businessId,
    soloarId: input.soloarId,
    date: input.date,
    meterReading: input.meterReading,
  }
}

export async function listSoloars(): Promise<Soloar[]> {
  const result = await request<SoloarListResponse>(`${BASE_URL}?limit=1000`, {
    cache: "no-store",
  })
  return result.data
}

export async function getSoloar(id: number): Promise<Soloar | undefined> {
  try {
    return await request<Soloar>(`${BASE_URL}/${id}`, { cache: "no-store" })
  } catch (error) {
    if (error instanceof SoloarApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createSoloar(input: CreateSoloarInput): Promise<Soloar> {
  return request<Soloar>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateSoloar(
  id: number,
  input: UpdateSoloarInput,
): Promise<Soloar> {
  return request<Soloar>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteSoloar(id: number): Promise<void> {
  await request<Soloar>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
