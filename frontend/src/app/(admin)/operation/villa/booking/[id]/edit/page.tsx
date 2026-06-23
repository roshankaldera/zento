import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { getBooking } from "@/lib/booking-service";
import { BookingForm } from "../../components/booking-form";
import { toBookingFormValues } from "../../components/booking-schema";
import { loadBookingOptions } from "../../components/booking-options";
import { BOOKING_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Booking | Zento",
  description: "Update an existing villa booking",
};

export default async function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [booking, { businessOptions, roomOptions }] = await Promise.all([
    Number.isFinite(Number(id)) ? getBooking(Number(id)) : undefined,
    loadBookingOptions(),
  ]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Booking" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {booking ? (
          <BookingForm
            mode="edit"
            bookingId={booking.id}
            defaultValues={toBookingFormValues(booking)}
            businessOptions={businessOptions}
            roomOptions={roomOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This booking could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={BOOKING_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
