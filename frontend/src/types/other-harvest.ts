/**
 * Other Harvest domain types. A flat record tying an estate (business), a
 * supplier and a crop to a dated quantity/value entry.
 */
export interface OtherHarvest {
  id: number
  estateId: number
  supplierId: number
  cropId: number
  /** Date-only ISO string from the API. */
  date: string
  /** Decimals serialized as strings by Prisma. */
  quantity: number
  value: number
  reference: string | null
  remark: string | null
  /** Joined names, included by the API. */
  estate?: { id: number; name: string }
  supplier?: { id: number; name: string }
  crop?: { id: number; name: string }
}

/** Payload to create an other-harvest record (server assigns `id`). */
export interface CreateOtherHarvestInput {
  estateId: number
  supplierId: number
  cropId: number
  date: string
  quantity: number
  value: number
  reference?: string | null
  remark?: string | null
}

export type UpdateOtherHarvestInput = CreateOtherHarvestInput
