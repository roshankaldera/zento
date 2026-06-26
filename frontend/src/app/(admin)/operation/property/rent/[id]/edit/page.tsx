import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import type { Option } from "@/components/hook-form";
import { Button } from "@/components/ui/button";
import { listAssets } from "@/lib/asset-service";
import { listBusinesses } from "@/lib/business-service";
import { getRent } from "@/lib/rent-service";
import { RentForm } from "../../components/rent-form";
import {
  toRentFormValues,
  type BusinessScopedOption,
} from "../../components/rent-schema";
import { RENT_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Rent | Zento",
  description: "Update an existing rent agreement",
};

export default async function EditRentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [rent, businesses, assets] = await Promise.all([
    Number.isFinite(Number(id)) ? getRent(Number(id)) : undefined,
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
      <PageBreadcrumb pageTitle="Edit Rent" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {rent ? (
          <RentForm
            mode="edit"
            rentId={rent.id}
            defaultValues={toRentFormValues(rent)}
            businessOptions={businessOptions}
            assetOptions={assetOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This rent record could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={RENT_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
