import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { BookingForm } from "../components/booking-form";
import { bookingFormDefaults } from "../components/booking-schema";
import { loadBookingOptions } from "../components/booking-options";

export const metadata: Metadata = {
  title: "New Booking | Zento",
  description: "Add a new villa booking",
};

export default async function NewVillaBookingPage() {
  const { businessOptions, roomOptions } = await loadBookingOptions();

  return (
    <div>
      <PageBreadcrumb pageTitle="New Booking" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <BookingForm
          mode="create"
          defaultValues={bookingFormDefaults}
          businessOptions={businessOptions}
          roomOptions={roomOptions}
        />
      </div>
    </div>
  );
}
