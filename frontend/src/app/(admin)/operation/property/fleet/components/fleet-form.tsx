"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { RHFForm, RHFInput, RHFSelect } from "@/components/hook-form"
import { createFleet, updateFleet } from "@/lib/fleet-service"
import {
  fleetSchema,
  statusOptions,
  toFleetInput,
  type FleetFormValues,
} from "./fleet-schema"
import { FLEET_LIST_PATH } from "./constants"

interface FleetFormProps {
  mode: "create" | "edit"
  fleetId?: number
  defaultValues: FleetFormValues
}

/**
 * Shared create/edit form for a Fleet. The renewal dates are mm/dd text fields
 * (regex-validated). On success it returns to the list and refreshes it.
 */
export function FleetForm({ mode, fleetId, defaultValues }: FleetFormProps) {
  const router = useRouter()

  const form = useForm<FleetFormValues>({
    resolver: zodResolver(fleetSchema),
    mode: "onBlur",
    defaultValues,
  })

  const onSubmit = React.useCallback(
    async (values: FleetFormValues) => {
      const input = toFleetInput(values)
      try {
        if (mode === "edit" && fleetId != null) {
          await updateFleet(fleetId, input)
        } else {
          await createFleet(input)
        }
        router.push(FLEET_LIST_PATH)
        router.refresh()
      } catch {
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [mode, fleetId, router, form],
  )

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid max-w-xl gap-5">
      <RHFInput<FleetFormValues>
        name="vehicleNo"
        label="Vehicle Registration No"
        required
        placeholder="Enter vehicle no"
        maxLength={10}
      />
      <RHFInput<FleetFormValues>
        name="licenseDate"
        label="Revenue License Renewal Date"
        required
        placeholder="mm/dd"
        maxLength={5}
      />
      <RHFInput<FleetFormValues>
        name="insuranceDate"
        label="Insurance Renewal Date"
        required
        placeholder="mm/dd"
        maxLength={5}
      />
      <RHFSelect<FleetFormValues>
        name="status"
        label="Status"
        required
        options={statusOptions}
        triggerClassName="w-full sm:w-60"
      />

      {rootError && (
        <p className="text-sm text-destructive" role="alert">
          {rootError}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : mode === "edit" ? "Update" : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => router.push(FLEET_LIST_PATH)}
        >
          Cancel
        </Button>
      </div>
    </RHFForm>
  )
}
