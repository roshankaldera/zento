import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import type { Option } from "@/components/hook-form";
import { listAssets } from "@/lib/asset-service";
import { listBusinesses } from "@/lib/business-service";
import { FleetForm } from "../components/fleet-form";
import {
  fleetFormDefaults,
  type BusinessScopedOption,
} from "../components/fleet-schema";

export const metadata: Metadata = {
  title: "New Fleet | Zento",
  description: "Add a new fleet vehicle",
};

export default async function NewFleetPage() {
  const [businesses, assets] = await Promise.all([
    listBusinesses().catch(() => []),
    listAssets().catch(() => []),
  ]);
  const businessOptions: Option[] = businesses.map((b) => ({
    label: b.name,
    value: String(b.id),
  }));
  // Fleet references a Vehicle-type asset (type 2); tag each with its business
  // so the form can scope the list to the selected business.
  const assetOptions: BusinessScopedOption[] = assets
    .filter((a) => a.type === 2)
    .map((a) => ({
      label: a.name,
      value: String(a.id),
      businessId: a.businessId,
    }));

  return (
    <div>
      <PageBreadcrumb pageTitle="New Fleet" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <FleetForm
          mode="create"
          defaultValues={fleetFormDefaults}
          businessOptions={businessOptions}
          assetOptions={assetOptions}
        />
      </div>
    </div>
  );
}
