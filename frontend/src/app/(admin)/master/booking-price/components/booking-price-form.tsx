"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  RHFAutocomplete,
  RHFCurrencyInput,
  RHFDatePicker,
  RHFForm,
  RHFInput,
  RHFSelect,
  type Option,
} from "@/components/hook-form"
import {
  BookingPriceApiError,
  createBookingPrice,
  updateBookingPrice,
} from "@/lib/booking-price-service"
import {
  bookingPriceSchema,
  emptyBookingPriceLine,
  toBookingPriceInput,
  type BookingPriceFormValues,
  type BusinessScopedOption,
} from "./booking-price-schema"
import { BOOKING_PRICE_LIST_PATH } from "./constants"

interface BookingPriceFormProps {
  mode: "create" | "edit"
  bookingPriceId?: number
  defaultValues: BookingPriceFormValues
  /** Villa options for the header business select (fetched server-side). */
  businessOptions: Option[]
  /** All villa rooms, tagged with their business for client-side scoping. */
  roomOptions: BusinessScopedOption[]
}

/** The four price tiers rendered as a block of currency inputs per line. */
const PRICE_FIELDS: {
  name: keyof Omit<BookingPriceFormValues["lines"][number], "roomId">
  label: string
}[] = [
  { name: "otaPrice", label: "OTA Price" },
  { name: "directPrice", label: "Direct Price" },
  { name: "dmcPrice", label: "DMC Price" },
  { name: "localPrice", label: "Local Price" },
]

/**
 * Shared create/edit form for a Booking Price header plus its per-room price
 * lines. Rooms are scoped to the header's selected business. On success it
 * returns to the list and refreshes it.
 */
export function BookingPriceForm({
  mode,
  bookingPriceId,
  defaultValues,
  businessOptions,
  roomOptions,
}: BookingPriceFormProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const form = useForm<BookingPriceFormValues>({
    resolver: zodResolver(bookingPriceSchema),
    mode: "onBlur",
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  })

  // The room list is scoped to the header's selected business. Filtering is done
  // client-side off the pre-fetched, business-tagged room list. An explicit
  // defaultValue keeps the first render from seeing `undefined`.
  const selectedBusinessId = useWatch({
    control: form.control,
    name: "businessId",
    defaultValue: defaultValues.businessId,
  })
  const filteredRoomOptions = React.useMemo(
    () =>
      selectedBusinessId
        ? roomOptions.filter((o) => String(o.businessId) === selectedBusinessId)
        : [],
    [roomOptions, selectedBusinessId],
  )

  // When the business changes, clear every line's room so a room from the
  // previous villa can't be submitted. Skips the initial mount (ref starts
  // undefined) so a loaded record keeps its rooms.
  const prevBusinessId = React.useRef<string | undefined>(undefined)
  React.useEffect(() => {
    if (
      prevBusinessId.current !== undefined &&
      prevBusinessId.current !== selectedBusinessId
    ) {
      form.getValues("lines").forEach((_, index) => {
        form.setValue(`lines.${index}.roomId`, "", { shouldValidate: false })
      })
    }
    prevBusinessId.current = selectedBusinessId
  }, [selectedBusinessId, form])

  const onSubmit = React.useCallback(
    async (values: BookingPriceFormValues) => {
      const input = toBookingPriceInput(values)
      try {
        if (isEdit && bookingPriceId != null) {
          await updateBookingPrice(bookingPriceId, input)
          toast.success("Booking price updated.")
        } else {
          await createBookingPrice(input)
          toast.success("Booking price created.")
        }
        router.push(BOOKING_PRICE_LIST_PATH)
        router.refresh()
      } catch (error) {
        // 409 = the date range overlaps another price list for this business.
        const message =
          error instanceof BookingPriceApiError && error.status === 409
            ? error.message
            : "Something went wrong. Please try again."
        form.setError("root", { type: "manual", message })
      }
    },
    [isEdit, bookingPriceId, router, form],
  )

  const rootError = form.formState.errors.root?.message
  const linesError = form.formState.errors.lines?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid gap-7">
      <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
        <RHFSelect<BookingPriceFormValues>
          name="businessId"
          label="Business"
          required
          options={businessOptions}
          placeholder="Select a business"
          triggerClassName="w-full"
          className="sm:col-span-2"
        />
        <RHFDatePicker<BookingPriceFormValues>
          name="fromDate"
          label="From Date"
          required
          placeholder="Select from date"
          triggerClassName="w-full"
        />
        <RHFDatePicker<BookingPriceFormValues>
          name="toDate"
          label="To Date"
          required
          placeholder="Select to date"
          triggerClassName="w-full"
        />
        <RHFInput<BookingPriceFormValues>
          name="remark"
          label="Remark"
          placeholder="Optional notes"
          maxLength={100}
          className="sm:col-span-2"
        />
      </div>

      <hr></hr>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Room Prices</h3>
          <Button
            type="button"
            variant="outline"
            disabled={!selectedBusinessId}
            onClick={() => append({ ...emptyBookingPriceLine })}
          >
            Add line
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-muted-foreground dark:border-gray-800">
                <th className="px-3 py-2 font-medium">Room</th>
                <th className="w-32 px-3 py-2 font-medium">OTA Price</th>
                <th className="w-32 px-3 py-2 font-medium">Direct Price</th>
                <th className="w-32 px-3 py-2 font-medium">DMC Price</th>
                <th className="w-32 px-3 py-2 font-medium">Local Price</th>
                <th className="w-24 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr
                  key={field.id}
                  className="border-b border-gray-100 align-top last:border-0 dark:border-gray-800/60"
                >
                  <td className="px-3 py-2">
                    <RHFAutocomplete<BookingPriceFormValues>
                      name={`lines.${index}.roomId`}
                      options={filteredRoomOptions}
                      disabled={!selectedBusinessId}
                      placeholder={
                        selectedBusinessId
                          ? "Select room"
                          : "Select a business first"
                      }
                      searchPlaceholder="Search rooms..."
                      triggerClassName="w-full"
                    />
                  </td>
                  {PRICE_FIELDS.map((price) => (
                    <td key={price.name} className="px-3 py-2">
                      <RHFCurrencyInput<BookingPriceFormValues>
                        name={`lines.${index}.${price.name}`}
                        placeholder="0.00"
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {linesError && (
          <p className="text-sm text-destructive" role="alert">
            {linesError}
          </p>
        )}
      </div>

      {rootError && (
        <p className="text-sm text-destructive" role="alert">
          {rootError}
        </p>
      )}

      <hr></hr>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Update" : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => router.push(BOOKING_PRICE_LIST_PATH)}
        >
          Cancel
        </Button>
      </div>
    </RHFForm>
  )
}
