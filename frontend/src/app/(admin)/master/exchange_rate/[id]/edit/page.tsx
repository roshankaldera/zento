import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { getExchangeRate } from "@/lib/exchange-rate-service";
import { ExchangeRateForm } from "../../components/exchange-rate-form";
import { toExchangeRateFormValues } from "../../components/exchange-rate-schema";
import { EXCHANGE_RATE_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Exchange Rate | Zento",
  description: "Update an existing exchange rate",
};

export default async function EditExchangeRatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exchangeRate = Number.isFinite(Number(id))
    ? await getExchangeRate(Number(id))
    : undefined;

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Exchange Rate" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {exchangeRate ? (
          <ExchangeRateForm
            mode="edit"
            exchangeRateId={exchangeRate.id}
            defaultValues={toExchangeRateFormValues(exchangeRate)}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This exchange rate could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={EXCHANGE_RATE_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
