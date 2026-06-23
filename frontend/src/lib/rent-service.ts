import type { CreateRentInput, Rent, UpdateRentInput } from "@/types/rent"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/rents`

interface RentListResponse {
  data: Rent[]
  total: number
  page: number
  limit: number
}

export class RentApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "RentApiError"
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
    throw new RentApiError(message, response.status)
  }

  return (await response.json()) as T
}

function toPayload(input: CreateRentInput | UpdateRentInput) {
  return {
    businessId: input.businessId,
    assetId: input.assetId,
    tenant: input.tenant.trim(),
    advancedPayment: input.advancedPayment,
    securityBond: input.securityBond,
    rentValue: input.rentValue,
    whtValue: input.whtValue,
    whtCertificateCollected: input.whtCertificateCollected,
    startDate: input.startDate,
    endDate: input.endDate,
    paymentDay: input.paymentDay,
    status: input.status,
  }
}

export async function listRents(): Promise<Rent[]> {
  const result = await request<RentListResponse>(`${BASE_URL}?limit=1000`, {
    cache: "no-store",
  })
  return result.data
}

export async function getRent(id: number): Promise<Rent | undefined> {
  try {
    return await request<Rent>(`${BASE_URL}/${id}`, { cache: "no-store" })
  } catch (error) {
    if (error instanceof RentApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createRent(input: CreateRentInput): Promise<Rent> {
  return request<Rent>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateRent(
  id: number,
  input: UpdateRentInput,
): Promise<Rent> {
  return request<Rent>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteRent(id: number): Promise<void> {
  await request<Rent>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
