import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listRents } from "@/lib/rent-service";
import type { Rent } from "@/types/rent";
import { RentListScreen } from "./components/rent-list";

export const metadata: Metadata = {
  title: "Rent | Zento",
  description: "Zento property rent agreements",
};

export default async function OperationPropertyRentPage() {
  let initialRents: Rent[] = [];
  let error: string | null = null;
  try {
    initialRents = await listRents();
  } catch {
    error = "Failed to load rent records.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Rent" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <RentListScreen initialRents={initialRents} error={error} />
      </div>
    </div>
  );
}
