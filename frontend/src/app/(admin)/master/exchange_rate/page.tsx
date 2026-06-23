import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listExchangeRates } from "@/lib/exchange-rate-service";
import type { ExchangeRate } from "@/types/exchange-rate";
import { ExchangeRateListScreen } from "./components/exchange-rate-list";

export const metadata: Metadata = {
  title: "Exchange Rate | Zento",
  description: "Zento daily currency exchange rates",
};

export default async function MasterExchangeRatePage() {
  let initialExchangeRates: ExchangeRate[] = [];
  let error: string | null = null;
  try {
    initialExchangeRates = await listExchangeRates();
  } catch {
    error = "Failed to load exchange rates.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Exchange Rate" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <ExchangeRateListScreen
          initialExchangeRates={initialExchangeRates}
          error={error}
        />
      </div>
    </div>
  );
}
