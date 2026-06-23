import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import type { Option } from "@/components/hook-form";
import { listBusinesses } from "@/lib/business-service";
import { BookingCalendar } from "./components/booking-calendar";

export const metadata: Metadata = {
  title: "Booking Calendar | Zento",
  description: "Monthly room occupancy calendar for a villa",
};

export default async function OperationVillaBookingPage() {
  // Only Villa businesses (type 2) own rooms, so the picker is limited to them.
  const businesses = await listBusinesses().catch(() => []);
  const businessOptions: Option[] = businesses
    .filter((b) => b.type === 2)
    .map((b) => ({ label: b.name, value: String(b.id) }));

  return (
    <div>
      <PageBreadcrumb pageTitle="Booking Calendar" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <BookingCalendar businessOptions={businessOptions} />
      </div>
    </div>
  );
}
