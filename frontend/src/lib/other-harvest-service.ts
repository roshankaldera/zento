import type {
  CreateOtherHarvestInput,
  OtherHarvest,
  UpdateOtherHarvestInput,
} from "@/types/other-harvest"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/other-harvests`

interface OtherHarvestListResponse {
  data: OtherHarvest[]
  total: number
  page: number
  limit: number
}

export class OtherHarvestApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "OtherHarvestApiError"
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
    throw new OtherHarvestApiError(message, response.status)
  }

  return (await response.json()) as T
}

function toPayload(input: CreateOtherHarvestInput | UpdateOtherHarvestInput) {
  const reference = input.reference?.trim()
  const remark = input.remark?.trim()
  return {
    estateId: input.estateId,
    supplierId: input.supplierId,
    cropId: input.cropId,
    date: input.date,
    quantity: input.quantity,
    value: input.value,
    reference: reference ? reference : null,
    remark: remark ? remark : null,
  }
}

export async function listOtherHarvests(): Promise<OtherHarvest[]> {
  const result = await request<OtherHarvestListResponse>(
    `${BASE_URL}?limit=1000`,
    { cache: "no-store" },
  )
  return result.data
}

export async function getOtherHarvest(
  id: number,
): Promise<OtherHarvest | undefined> {
  try {
    return await request<OtherHarvest>(`${BASE_URL}/${id}`, {
      cache: "no-store",
    })
  } catch (error) {
    if (error instanceof OtherHarvestApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createOtherHarvest(
  input: CreateOtherHarvestInput,
): Promise<OtherHarvest> {
  return request<OtherHarvest>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateOtherHarvest(
  id: number,
  input: UpdateOtherHarvestInput,
): Promise<OtherHarvest> {
  return request<OtherHarvest>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteOtherHarvest(id: number): Promise<void> {
  await request<OtherHarvest>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
