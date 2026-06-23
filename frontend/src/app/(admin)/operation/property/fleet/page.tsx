import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listFleets } from "@/lib/fleet-service";
import type { Fleet } from "@/types/fleet";
import { FleetListScreen } from "./components/fleet-list";

export const metadata: Metadata = {
  title: "Fleet | Zento",
  description: "Zento fleet vehicle records",
};

export default async function MasterFleetPage() {
  let initialFleets: Fleet[] = [];
  let error: string | null = null;
  try {
    initialFleets = await listFleets();
  } catch {
    error = "Failed to load fleet records.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Fleet" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <FleetListScreen initialFleets={initialFleets} error={error} />
      </div>
    </div>
  );
}
