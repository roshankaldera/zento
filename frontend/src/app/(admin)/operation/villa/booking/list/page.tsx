import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listBookings } from "@/lib/booking-service";
import type { Booking } from "@/types/booking";
import { BookingListScreen } from "../components/booking-list";

export const metadata: Metadata = {
  title: "Booking | Zento",
  description: "Zento villa booking records",
};

export default async function OperationVillaBookingListPage() {
  let initialBookings: Booking[] = [];
  let error: string | null = null;
  try {
    initialBookings = await listBookings();
  } catch {
    error = "Failed to load bookings.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Booking" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <BookingListScreen initialBookings={initialBookings} error={error} />
      </div>
    </div>
  );
}
