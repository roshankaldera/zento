/** 1 = Active, 2 = Inactive. */
export type FleetStatus = 1 | 2

export interface Fleet {
  id: number
  businessId: number
  assetId: number
  vehicleNo: string
  /** mm/dd (recurring renewal day, no year). */
  licenseDate: string
  insuranceDate: string
  status: FleetStatus
  /** The owning business, included by the API. */
  business?: { id: number; name: string }
  /** The referenced vehicle asset, included by the API. */
  asset?: { id: number; name: string }
}

/** Payload to create a fleet (server assigns `id`). */
export interface CreateFleetInput {
  businessId: number
  assetId: number
  vehicleNo: string
  licenseDate: string
  insuranceDate: string
  status: FleetStatus
}

export type UpdateFleetInput = CreateFleetInput
