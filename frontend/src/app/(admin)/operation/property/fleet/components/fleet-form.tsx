"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  RHFAutocomplete,
  RHFForm,
  RHFInput,
  RHFSelect,
  type Option,
} from "@/components/hook-form"
import { createFleet, updateFleet } from "@/lib/fleet-service"
import {
  fleetSchema,
  statusOptions,
  toFleetInput,
  type BusinessScopedOption,
  type FleetFormValues,
} from "./fleet-schema"
import { FLEET_LIST_PATH } from "./constants"

interface FleetFormProps {
  mode: "create" | "edit"
  fleetId?: number
  defaultValues: FleetFormValues
  /** Business options for the top dropdown (fetched server-side). */
  businessOptions: Option[]
  /** Vehicle asset options, tagged with their business for client-side scoping. */
  assetOptions: BusinessScopedOption[]
}

/**
 * Shared create/edit form for a Fleet. The renewal dates are mm/dd text fields
 * (regex-validated). On success it returns to the list and refreshes it.
 */
export function FleetForm({
  mode,
  fleetId,
  defaultValues,
  businessOptions,
  assetOptions,
}: FleetFormProps) {
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
          toast.success("Fleet updated.")
        } else {
          await createFleet(input)
          toast.success("Fleet created.")
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

  // The vehicle-asset list is scoped to the selected business. Filtering is done
  // client-side off the pre-fetched, business-tagged option list.
  const selectedBusinessId = useWatch({
    control: form.control,
    name: "businessId",
  })
  const filteredAssetOptions = React.useMemo(
    () =>
      selectedBusinessId
        ? assetOptions.filter(
            (o) => String(o.businessId) === selectedBusinessId,
          )
        : [],
    [assetOptions, selectedBusinessId],
  )

  // When the business changes, clear the asset that belonged to the previous
  // business so a stale FK can't be submitted. Skips the initial mount (ref
  // starts undefined) so a loaded record keeps its selection.
  const prevBusinessId = React.useRef<string | undefined>(undefined)
  React.useEffect(() => {
    if (
      prevBusinessId.current !== undefined &&
      prevBusinessId.current !== selectedBusinessId
    ) {
      form.setValue("assetId", "", { shouldValidate: false })
    }
    prevBusinessId.current = selectedBusinessId
  }, [selectedBusinessId, form])

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid max-w-xl gap-5">
      <RHFSelect<FleetFormValues>
        name="businessId"
        label="Business"
        required
        options={businessOptions}
        placeholder="Select a business"
        triggerClassName="w-full sm:w-80"
      />
      <RHFAutocomplete<FleetFormValues>
        name="assetId"
        label="Fleet Asset"
        required
        options={filteredAssetOptions}
        disabled={!selectedBusinessId}
        placeholder={
          selectedBusinessId ? "Select a vehicle asset" : "Select a business first"
        }
        searchPlaceholder="Search vehicle assets..."
        triggerClassName="w-full sm:w-80"
      />
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
