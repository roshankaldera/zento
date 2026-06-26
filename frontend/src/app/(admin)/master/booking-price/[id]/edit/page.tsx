import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { getBookingPrice } from "@/lib/booking-price-service";
import { BookingPriceForm } from "../../components/booking-price-form";
import { toBookingPriceFormValues } from "../../components/booking-price-schema";
import { loadBookingPriceOptions } from "../../components/booking-price-options";
import { BOOKING_PRICE_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Booking Price | Zento",
  description: "Update an existing villa room price list",
};

export default async function EditBookingPricePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [bookingPrice, { businessOptions, roomOptions }] = await Promise.all([
    Number.isFinite(Number(id)) ? getBookingPrice(Number(id)) : undefined,
    loadBookingPriceOptions(),
  ]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Booking Price" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {bookingPrice ? (
          <BookingPriceForm
            mode="edit"
            bookingPriceId={bookingPrice.id}
            defaultValues={toBookingPriceFormValues(bookingPrice)}
            businessOptions={businessOptions}
            roomOptions={roomOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This booking price could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={BOOKING_PRICE_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
