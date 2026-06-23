import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import type { Option } from "@/components/hook-form";
import { Button } from "@/components/ui/button";
import { listBookings } from "@/lib/booking-service";
import { listBusinesses } from "@/lib/business-service";
import { getKot } from "@/lib/kot-service";
import { KotForm } from "../../components/kot-form";
import { toKotFormValues } from "../../components/kot-schema";
import { KOT_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit KOT | Zento",
  description: "Update an existing kitchen order ticket",
};

export default async function EditKotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [kot, businesses, bookings] = await Promise.all([
    Number.isFinite(Number(id)) ? getKot(Number(id)) : undefined,
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
      <PageBreadcrumb pageTitle="Edit KOT" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {kot ? (
          <KotForm
            mode="edit"
            kotId={kot.id}
            defaultValues={toKotFormValues(kot)}
            businessOptions={businessOptions}
            bookingOptions={bookingOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This KOT could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={KOT_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
