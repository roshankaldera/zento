import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import type { Option } from "@/components/hook-form";
import { listAssets } from "@/lib/asset-service";
import { listBusinesses } from "@/lib/business-service";
import { RentForm } from "../components/rent-form";
import {
  rentFormDefaults,
  type BusinessScopedOption,
} from "../components/rent-schema";

export const metadata: Metadata = {
  title: "New Rent | Zento",
  description: "Add a new rent agreement",
};

export default async function NewRentPage() {
  const [businesses, assets] = await Promise.all([
    listBusinesses().catch(() => []),
    listAssets().catch(() => []),
  ]);
  const businessOptions: Option[] = businesses.map((b) => ({
    label: b.name,
    value: String(b.id),
  }));
  // Rent applies to Building-type assets (type 3).
  const assetOptions: BusinessScopedOption[] = assets
    .filter((a) => a.type === 3)
    .map((a) => ({
      label: a.name,
      value: String(a.id),
      businessId: a.businessId,
    }));

  return (
    <div>
      <PageBreadcrumb pageTitle="New Rent" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <RentForm
          mode="create"
          defaultValues={rentFormDefaults}
          businessOptions={businessOptions}
          assetOptions={assetOptions}
        />
      </div>
    </div>
  );
}
