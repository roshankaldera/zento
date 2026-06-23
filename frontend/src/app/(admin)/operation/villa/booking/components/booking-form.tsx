"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  RHFCurrencyInput,
  RHFDatePicker,
  RHFForm,
  RHFInput,
  RHFMultiSelect,
  RHFNumberInput,
  RHFSelect,
  type Option,
} from "@/components/hook-form"
import { createBooking, updateBooking } from "@/lib/booking-service"
import {
  bookingFormDefaults,
  bookingSchema,
  categoryOptions,
  currencyOptions,
  formatMoney,
  LKR,
  segmentOptions,
  statusOptions,
  toBookingInput,
  type BookingFormValues,
} from "./booking-schema"
import { BOOKING_LIST_PATH, BOOKING_NEW_PATH } from "./constants"

/** Fresh empty form values for create mode. */
const freshDefaults = (): BookingFormValues => ({ ...bookingFormDefaults })

/**
 * A room option that carries its owning villa `businessId`, so the Rooms
 * multi-select can be filtered to the selected business client-side.
 */
export interface BusinessScopedOption extends Option {
  businessId: number
}

interface BookingFormProps {
  mode: "create" | "edit"
  bookingId?: number
  defaultValues: BookingFormValues
  /** Villa options for the FK select (fetched server-side). */
  businessOptions: Option[]
  /** All villa rooms, tagged with their villa's id, scoped by business. */
  roomOptions: BusinessScopedOption[]
}

/** A disabled-looking, read-only value box. */
function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex h-10 items-center rounded-lg border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
        {value}
      </div>
    </div>
  )
}

/** The money/revenue fields, rendered as a block of currency inputs. */
const MONEY_FIELDS: { name: keyof BookingFormValues; label: string }[] = [
  { name: "invoiceValue", label: "Invoice Value" },
  { name: "vat", label: "VAT" },
  { name: "sscl", label: "SSCL" },
  { name: "grossRevenue", label: "Gross Revenue" },
  { name: "commission", label: "Commission" },
  { name: "netRevenue", label: "Net Revenue" },
  { name: "bankCharges", label: "Bank Charges" },
  { name: "finalRevenue", label: "Final Revenue" },
  { name: "tscCommission", label: "TSC Commission" },
  { name: "payout", label: "Payout" },
]

/**
 * Shared create/edit form for a Booking. When the currency is LKR the exchange
 * rate is locked to 1 and shown disabled. On success it returns to the list and
 * refreshes it.
 */
export function BookingForm({
  mode,
  bookingId,
  defaultValues,
  businessOptions,
  roomOptions,
}: BookingFormProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    mode: "onBlur",
    defaultValues,
  })

  // Business rule: LKR locks the exchange rate to 1 (field disabled).
  const currency = useWatch({ control: form.control, name: "currency" })
  const isLkr = currency === LKR
  React.useEffect(() => {
    if (isLkr) form.setValue("exRate", 1, { shouldValidate: false })
  }, [isLkr, form])

  // The Rooms multi-select is scoped to the selected business. Filtering is
  // done client-side off the pre-fetched, business-tagged room list.
  const selectedBusinessId = useWatch({
    control: form.control,
    name: "businessId",
  })
  const filteredRoomOptions = React.useMemo(
    () =>
      selectedBusinessId
        ? roomOptions.filter((o) => String(o.businessId) === selectedBusinessId)
        : [],
    [roomOptions, selectedBusinessId],
  )

  // When the business changes, clear the rooms that belonged to the previous
  // villa so a stale id can't be submitted. Skips the initial mount (ref starts
  // undefined) so a loaded record keeps its rooms.
  const prevBusinessId = React.useRef<string | undefined>(undefined)
  React.useEffect(() => {
    if (
      prevBusinessId.current !== undefined &&
      prevBusinessId.current !== selectedBusinessId
    ) {
      form.setValue("roomIds", [], { shouldValidate: false })
    }
    prevBusinessId.current = selectedBusinessId
  }, [selectedBusinessId, form])

  const onSubmit = React.useCallback(
    async (values: BookingFormValues) => {
      const input = toBookingInput(values)
      try {
        if (isEdit && bookingId != null) {
          await updateBooking(bookingId, input)
          // Update mode: switch to an empty New form after a successful save.
          router.push(BOOKING_NEW_PATH)
          router.refresh()
        } else {
          await createBooking(input)
          // Create mode: clear the form and stay on the New page (no redirect).
          form.reset(freshDefaults())
          router.refresh()
        }
      } catch {
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [isEdit, bookingId, router, form],
  )

  // Clear: in create mode reset to an empty form (stay); in edit mode switch
  // the page to New mode (empty create form).
  const handleClear = React.useCallback(() => {
    if (isEdit) {
      router.push(BOOKING_NEW_PATH)
    } else {
      form.reset(freshDefaults())
    }
  }, [isEdit, router, form])

  // Print: only meaningful in edit mode — print the current record/form.
  const handlePrint = React.useCallback(() => {
    if (isEdit) {
      window.print()
    }
  }, [isEdit])

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm
      form={form}
      onSubmit={onSubmit}
      className="grid max-w-3xl gap-5 sm:grid-cols-2"
    >
      <RHFInput<BookingFormValues>
        name="bookingNo"
        label="Booking No"
        disabled
        placeholder="Auto-generated on save"
        maxLength={15}
        className="sm:col-span-2"
      />
      <RHFSelect<BookingFormValues>
        name="businessId"
        label="Business"
        required
        options={businessOptions}
        placeholder="Select a business"
        triggerClassName="w-full"
      />
      <RHFSelect<BookingFormValues>
        name="category"
        label="Category"
        required
        options={categoryOptions}
        triggerClassName="w-full"
      />
      <RHFMultiSelect<BookingFormValues>
        name="roomIds"
        label="Rooms"
        required
        options={filteredRoomOptions}
        placeholder={
          selectedBusinessId ? "Select rooms" : "Select a business first"
        }
        searchPlaceholder="Search rooms..."
        emptyMessage="This villa has no rooms."
        disabled={!selectedBusinessId}
        className="sm:col-span-2"
      />
      <RHFInput<BookingFormValues>
        name="customer"
        label="Customer"
        required
        placeholder="Customer name"
        maxLength={100}
        className="sm:col-span-2"
      />
      <RHFDatePicker<BookingFormValues>
        name="fromDate"
        label="From Date"
        required
        placeholder="Select from date"
        triggerClassName="w-full"
      />
      <RHFDatePicker<BookingFormValues>
        name="toDate"
        label="To Date"
        required
        placeholder="Select to date"
        triggerClassName="w-full"
      />
      <RHFNumberInput<BookingFormValues>
        name="pax"
        label="PAX"
        required
        allowNegative={false}
        decimalScale={0}
        placeholder="0"
      />
      <RHFNumberInput<BookingFormValues>
        name="child"
        label="Child"
        required
        allowNegative={false}
        decimalScale={0}
        placeholder="0"
      />
      <RHFSelect<BookingFormValues>
        name="status"
        label="Status"
        required
        options={statusOptions}
        triggerClassName="w-full"
      />
      <RHFSelect<BookingFormValues>
        name="segment"
        label="Segment"
        required
        options={segmentOptions}
        triggerClassName="w-full"
      />
      <RHFSelect<BookingFormValues>
        name="currency"
        label="Currency"
        required
        options={currencyOptions}
        triggerClassName="w-full"
      />
      {isLkr ? (
        <ReadOnlyField label="Exchange Rate" value={formatMoney(1)} />
      ) : (
        <RHFCurrencyInput<BookingFormValues>
          name="exRate"
          label="Exchange Rate"
          required
          placeholder="0.00"
        />
      )}

      {MONEY_FIELDS.map((f) => (
        <RHFCurrencyInput<BookingFormValues>
          key={f.name}
          name={f.name}
          label={f.label}
          placeholder="0.00"
        />
      ))}

      {rootError && (
        <p className="text-sm text-destructive sm:col-span-2" role="alert">
          {rootError}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2 sm:col-span-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={handleClear}
        >
          Clear
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting || !isEdit}
          onClick={handlePrint}
        >
          Print
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => router.push(BOOKING_LIST_PATH)}
        >
          List
        </Button>
      </div>
    </RHFForm>
  )
}
