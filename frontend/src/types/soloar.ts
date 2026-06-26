export interface Soloar {
  id: number
  businessId: number
  soloarId: number
  date: string
  /** Decimal serialized as string by Prisma. */
  meterReading: number
  /** The referenced solar asset, included by the API. */
  asset?: { id: number; name: string }
}

/** Payload to create a soloar reading (server assigns `id`). */
export interface CreateSoloarInput {
  businessId: number
  soloarId: number
  date: string
  meterReading: number
}

export type UpdateSoloarInput = CreateSoloarInput
