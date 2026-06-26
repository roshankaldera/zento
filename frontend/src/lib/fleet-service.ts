import type { CreateFleetInput, Fleet, UpdateFleetInput } from "@/types/fleet"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/fleets`

interface FleetListResponse {
  data: Fleet[]
  total: number
  page: number
  limit: number
}

export class FleetApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "FleetApiError"
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
    throw new FleetApiError(message, response.status)
  }

  return (await response.json()) as T
}

function toPayload(input: CreateFleetInput | UpdateFleetInput) {
  return {
    businessId: input.businessId,
    assetId: input.assetId,
    vehicleNo: input.vehicleNo.trim(),
    licenseDate: input.licenseDate.trim(),
    insuranceDate: input.insuranceDate.trim(),
    status: input.status,
  }
}

export async function listFleets(): Promise<Fleet[]> {
  const result = await request<FleetListResponse>(`${BASE_URL}?limit=1000`, {
    cache: "no-store",
  })
  return result.data
}

export async function getFleet(id: number): Promise<Fleet | undefined> {
  try {
    return await request<Fleet>(`${BASE_URL}/${id}`, { cache: "no-store" })
  } catch (error) {
    if (error instanceof FleetApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createFleet(input: CreateFleetInput): Promise<Fleet> {
  return request<Fleet>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateFleet(
  id: number,
  input: UpdateFleetInput,
): Promise<Fleet> {
  return request<Fleet>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteFleet(id: number): Promise<void> {
  await request<Fleet>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
