import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { BookingPriceForm } from "../components/booking-price-form";
import { bookingPriceFormDefaults } from "../components/booking-price-schema";
import { loadBookingPriceOptions } from "../components/booking-price-options";

export const metadata: Metadata = {
  title: "New Booking Price | Zento",
  description: "Add a new villa room price list",
};

export default async function NewBookingPricePage() {
  const { businessOptions, roomOptions } = await loadBookingPriceOptions();

  return (
    <div>
      <PageBreadcrumb pageTitle="New Booking Price" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <BookingPriceForm
          mode="create"
          defaultValues={bookingPriceFormDefaults}
          businessOptions={businessOptions}
          roomOptions={roomOptions}
        />
      </div>
    </div>
  );
}
