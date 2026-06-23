import type { CashFlowReportRow } from "@/types/cash-flow-report"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/reports`

export class CashFlowReportApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "CashFlowReportApiError"
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

/** Fetch the consolidated cash-flow dataset (journals + transfers + recurring). */
export async function getCashFlowReport(): Promise<CashFlowReportRow[]> {
  const response = await fetch(`${BASE_URL}/cash-flow`, { cache: "no-store" })
  if (!response.ok) {
    throw new CashFlowReportApiError(await readError(response), response.status)
  }
  return (await response.json()) as CashFlowReportRow[]
}
