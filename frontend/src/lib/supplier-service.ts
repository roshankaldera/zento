import type {
  CreateSupplierInput,
  Supplier,
  UpdateSupplierInput,
} from "@/types/supplier"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/suppliers`

interface SupplierListResponse {
  data: Supplier[]
  total: number
  page: number
  limit: number
}

/** Thrown when the name collides with an existing record (HTTP 409). */
export class DuplicateSupplierNameError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DuplicateSupplierNameError"
  }
}

export class SupplierApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "SupplierApiError"
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
      throw new DuplicateSupplierNameError(message)
    }
    throw new SupplierApiError(message, response.status)
  }

  return (await response.json()) as T
}

function toPayload(input: CreateSupplierInput | UpdateSupplierInput) {
  const contactPerson = input.contactPerson?.trim()
  const contactNo = input.contactNo?.trim()
  return {
    name: input.name.trim(),
    contactPerson: contactPerson ? contactPerson : null,
    contactNo: contactNo ? contactNo : null,
    balance: input.balance,
    status: input.status,
  }
}

export async function listSuppliers(): Promise<Supplier[]> {
  const result = await request<SupplierListResponse>(`${BASE_URL}?limit=1000`, {
    cache: "no-store",
  })
  return result.data
}

export async function getSupplier(id: number): Promise<Supplier | undefined> {
  try {
    return await request<Supplier>(`${BASE_URL}/${id}`, { cache: "no-store" })
  } catch (error) {
    if (error instanceof SupplierApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createSupplier(
  input: CreateSupplierInput,
): Promise<Supplier> {
  return request<Supplier>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateSupplier(
  id: number,
  input: UpdateSupplierInput,
): Promise<Supplier> {
  return request<Supplier>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteSupplier(id: number): Promise<void> {
  await request<Supplier>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
