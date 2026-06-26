import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listBookingPrices } from "@/lib/booking-price-service";
import type { BookingPriceList } from "@/types/booking-price";
import { BookingPriceListScreen } from "./components/booking-price-list";

export const metadata: Metadata = {
  title: "Booking Price | Zento",
  description: "Zento villa room price lists",
};

export default async function MasterBookingPricePage() {
  let initialBookingPrices: BookingPriceList[] = [];
  let error: string | null = null;
  try {
    initialBookingPrices = await listBookingPrices();
  } catch {
    error = "Failed to load booking prices.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Booking Price" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <BookingPriceListScreen
          initialBookingPrices={initialBookingPrices}
          error={error}
        />
      </div>
    </div>
  );
}
