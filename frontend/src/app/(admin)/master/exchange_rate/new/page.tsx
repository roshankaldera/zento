import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { ExchangeRateForm } from "../components/exchange-rate-form";
import { exchangeRateFormDefaults } from "../components/exchange-rate-schema";

export const metadata: Metadata = {
  title: "New Exchange Rate | Zento",
  description: "Add a new exchange rate",
};

export default function NewExchangeRatePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="New Exchange Rate" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <ExchangeRateForm
          mode="create"
          defaultValues={exchangeRateFormDefaults}
        />
      </div>
    </div>
  );
}
