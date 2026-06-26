import type { Asset, CreateAssetInput, UpdateAssetInput } from "@/types/asset"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/assets`

interface AssetListResponse {
  data: Asset[]
  total: number
  page: number
  limit: number
}

/** Thrown when the name collides with an existing record (HTTP 409). */
export class DuplicateAssetNameError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DuplicateAssetNameError"
  }
}

export class AssetApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "AssetApiError"
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
      throw new DuplicateAssetNameError(message)
    }
    throw new AssetApiError(message, response.status)
  }

  return (await response.json()) as T
}

function toPayload(input: CreateAssetInput | UpdateAssetInput) {
  const remark = input.remark?.trim()
  return {
    businessId: input.businessId,
    name: input.name.trim(),
    type: input.type,
    status: input.status,
    remark: remark ? remark : null,
  }
}

export async function listAssets(): Promise<Asset[]> {
  const result = await request<AssetListResponse>(`${BASE_URL}?limit=1000`, {
    cache: "no-store",
  })
  return result.data
}

export async function getAsset(id: number): Promise<Asset | undefined> {
  try {
    return await request<Asset>(`${BASE_URL}/${id}`, { cache: "no-store" })
  } catch (error) {
    if (error instanceof AssetApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createAsset(input: CreateAssetInput): Promise<Asset> {
  return request<Asset>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateAsset(
  id: number,
  input: UpdateAssetInput,
): Promise<Asset> {
  return request<Asset>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteAsset(id: number): Promise<void> {
  await request<Asset>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
