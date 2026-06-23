import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import type { Option } from "@/components/hook-form";
import { listBookings } from "@/lib/booking-service";
import { listBusinesses } from "@/lib/business-service";
import { KotForm } from "./components/kot-form";
import { kotFormDefaults } from "./components/kot-schema";

export const metadata: Metadata = {
  title: "New KOT | Zento",
  description: "Add a new kitchen order ticket",
};

export default async function OperationVillaKotPage() {
  const [businesses, bookings] = await Promise.all([
    listBusinesses().catch(() => []),
    listBookings().catch(() => []),
  ]);
  const businessOptions: Option[] = businesses.map((b) => ({
    label: b.name,
    value: String(b.id),
  }));
  const bookingOptions: Option[] = bookings.map((b) => ({
    label: `${b.customer} — ${b.fromDate.slice(0, 10)}`,
    value: String(b.id),
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="New KOT" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <KotForm
          mode="create"
          defaultValues={kotFormDefaults}
          businessOptions={businessOptions}
          bookingOptions={bookingOptions}
        />
      </div>
    </div>
  );
}
