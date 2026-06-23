export interface KotLine {
  id: number
  mainId: number
  item: string
  /** Decimal serialized as string by Prisma. */
  quantity: number
  remark: string | null
}

export interface Kot {
  id: number
  businessId: number
  bookingId: number
  requestTime: string
  remark: string | null
  business?: { id: number; name: string }
  booking?: { id: number; customer: string }
  /** Present on detail (findOne) responses. */
  lines?: KotLine[]
  /** Present on list (findAll) responses. */
  _count?: { lines: number }
}

/** A single line in the create/update payload (server assigns id + main_id). */
export interface CreateKotLineInput {
  item: string
  quantity: number
  remark?: string | null
}

/** Payload to create a KOT header together with its lines. */
export interface CreateKotInput {
  businessId: number
  bookingId: number
  requestTime: string
  remark?: string | null
  lines: CreateKotLineInput[]
}

export type UpdateKotInput = CreateKotInput
