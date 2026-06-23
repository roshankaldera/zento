/** 1 = Active, 2 = Inactive. */
export type FleetStatus = 1 | 2

export interface Fleet {
  id: number
  vehicleNo: string
  /** mm/dd (recurring renewal day, no year). */
  licenseDate: string
  insuranceDate: string
  status: FleetStatus
}

/** Payload to create a fleet (server assigns `id`). */
export interface CreateFleetInput {
  vehicleNo: string
  licenseDate: string
  insuranceDate: string
  status: FleetStatus
}

export type UpdateFleetInput = CreateFleetInput
