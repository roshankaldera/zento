/** 1 = Active, 2 = Finish, 3 = Canceled. */
export type RentStatus = 1 | 2 | 3

export interface Rent {
  id: number
  businessId: number
  assetId: number
  tenant: string
  /** Decimals serialized as strings by Prisma. */
  advancedPayment: number
  securityBond: number
  rentValue: number
  whtValue: number
  whtCertificateCollected: boolean
  startDate: string
  endDate: string
  paymentDay: number
  status: RentStatus
  business?: { id: number; name: string }
  asset?: { id: number; name: string }
}

/** Payload to create a rent (server assigns `id`). */
export interface CreateRentInput {
  businessId: number
  assetId: number
  tenant: string
  advancedPayment: number
  securityBond: number
  rentValue: number
  whtValue: number
  whtCertificateCollected: boolean
  startDate: string
  endDate: string
  paymentDay: number
  status: RentStatus
}

export type UpdateRentInput = CreateRentInput
