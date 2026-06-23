import type {
  CreateKotIngredientInput,
  KotIngredient,
  UpdateKotIngredientInput,
} from "@/types/kot-ingredient"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/kot-ingredients`

interface KotIngredientListResponse {
  data: KotIngredient[]
  total: number
  page: number
  limit: number
}

export class KotIngredientApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "KotIngredientApiError"
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
    throw new KotIngredientApiError(message, response.status)
  }

  return (await response.json()) as T
}

function toPayload(input: CreateKotIngredientInput | UpdateKotIngredientInput) {
  const remark = input.remark?.trim()
  return {
    kotIds: input.kotIds,
    date: input.date,
    remark: remark ? remark : null,
    lines: input.lines.map((line) => {
      const lineRemark = line.remark?.trim()
      return {
        item: line.item.trim(),
        uom: line.uom,
        requestQuantity: line.requestQuantity,
        receivedQuantity: line.receivedQuantity,
        remark: lineRemark ? lineRemark : null,
      }
    }),
  }
}

export async function listKotIngredients(): Promise<KotIngredient[]> {
  const result = await request<KotIngredientListResponse>(
    `${BASE_URL}?limit=1000`,
    { cache: "no-store" },
  )
  return result.data
}

export async function getKotIngredient(
  id: number,
): Promise<KotIngredient | undefined> {
  try {
    return await request<KotIngredient>(`${BASE_URL}/${id}`, {
      cache: "no-store",
    })
  } catch (error) {
    if (error instanceof KotIngredientApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createKotIngredient(
  input: CreateKotIngredientInput,
): Promise<KotIngredient> {
  return request<KotIngredient>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateKotIngredient(
  id: number,
  input: UpdateKotIngredientInput,
): Promise<KotIngredient> {
  return request<KotIngredient>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteKotIngredient(id: number): Promise<void> {
  await request<KotIngredient>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
