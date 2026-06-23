import type {
  Attendance,
  CreateAttendanceInput,
  UpdateAttendanceInput,
} from "@/types/attendance"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const BASE_URL = `${API_BASE}/attendances`

interface AttendanceListResponse {
  data: Attendance[]
  total: number
  page: number
  limit: number
}

/** Thrown on a 409 — a duplicate (business + date) header or (employee + shift) line. */
export class DuplicateAttendanceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DuplicateAttendanceError"
  }
}

export class AttendanceApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "AttendanceApiError"
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
      throw new DuplicateAttendanceError(message)
    }
    throw new AttendanceApiError(message, response.status)
  }

  return (await response.json()) as T
}

function toPayload(input: CreateAttendanceInput | UpdateAttendanceInput) {
  const headerRemark = input.remark?.trim()
  return {
    businessId: input.businessId,
    date: input.date,
    remark: headerRemark ? headerRemark : null,
    lines: input.lines.map((line) => {
      const remark = line.remark?.trim()
      return {
        employeeId: line.employeeId,
        shift: line.shift,
        hours: line.hours,
        status: line.status,
        remark: remark ? remark : null,
      }
    }),
  }
}

export async function listAttendances(): Promise<Attendance[]> {
  const result = await request<AttendanceListResponse>(
    `${BASE_URL}?limit=1000`,
    { cache: "no-store" },
  )
  return result.data
}

export async function getAttendance(
  id: number,
): Promise<Attendance | undefined> {
  try {
    return await request<Attendance>(`${BASE_URL}/${id}`, { cache: "no-store" })
  } catch (error) {
    if (error instanceof AttendanceApiError && error.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function createAttendance(
  input: CreateAttendanceInput,
): Promise<Attendance> {
  return request<Attendance>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function updateAttendance(
  id: number,
  input: UpdateAttendanceInput,
): Promise<Attendance> {
  return request<Attendance>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toPayload(input)),
  })
}

export async function deleteAttendance(id: number): Promise<void> {
  await request<Attendance>(`${BASE_URL}/${id}`, { method: "DELETE" })
}
