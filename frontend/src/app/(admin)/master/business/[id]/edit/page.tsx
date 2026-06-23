import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { getBusiness } from "@/lib/business-service";
import { BusinessForm } from "../../components/business-form";
import { toBusinessFormValues } from "../../components/business-schema";
import { BUSINESS_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Business | Zento",
  description: "Update an existing business",
};

// Fetch the record on the server so the form pre-fills on first paint — no
// client fetch-on-mount and no skeleton flash.
export default async function EditBusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = Number.isFinite(Number(id))
    ? await getBusiness(Number(id))
    : undefined;

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Business" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {business ? (
          <BusinessForm
            mode="edit"
            businessId={business.id}
            defaultValues={toBusinessFormValues(business)}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This business could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={BUSINESS_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
