/**
 * Business master domain types.
 *
 * Mirrors the `business` table:
 *   id              int           PK, auto-increment
 *   name            varchar(100)  required, unique
 *   type            tinyint       required (1=Estate, 2=Villa, 3=Property, 4=Investment)
 *   contact_person  varchar(100)  nullable
 *   remark          varchar(100)  nullable
 *   status          tinyint       required, default 1 (1=Active, 2=Inactive)
 */

/** 1 = Estate, 2 = Villa, 3 = Property, 4 = Investment. */
export type BusinessType = 1 | 2 | 3 | 4

/** 1 = Active, 2 = Inactive. */
export type BusinessStatus = 1 | 2

export interface Business {
  id: number
  name: string
  type: BusinessType
  contactPerson: string | null
  remark: string | null
  status: BusinessStatus
  /** Present on detail (findOne) responses. */
  estateDivisions?: BusinessLine[]
  villaRooms?: BusinessLine[]
}

/**
 * A child line of a Business. Estate Divisions (type 1) and Villa Rooms (type 2)
 * share this exact shape; the parent `type` decides which table it belongs to.
 */
export interface BusinessLine {
  id: number
  businessId: number
  name: string
  remark: string | null
  status: BusinessStatus
}

/** A line in the create/update payload (server assigns id + business_id). */
export interface CreateBusinessLineInput {
  name: string
  remark?: string | null
  status: BusinessStatus
}

/** Payload to create a business (server assigns `id`). */
export interface CreateBusinessInput {
  name: string
  type: BusinessType
  contactPerson?: string | null
  remark?: string | null
  status: BusinessStatus
  /** Sent for Estate (type 1); the backend ignores it for other types. */
  estateDivisions?: CreateBusinessLineInput[]
  /** Sent for Villa (type 2); the backend ignores it for other types. */
  villaRooms?: CreateBusinessLineInput[]
}

/** Payload to update an existing business. */
export type UpdateBusinessInput = CreateBusinessInput
