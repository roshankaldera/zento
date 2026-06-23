import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listBusinesses } from "@/lib/business-service";
import type { Business } from "@/types/business";
import { BusinessListScreen } from "./components/business-list";

export const metadata: Metadata = {
  title: "Business | Zento",
  description: "Zento Business master list",
};

// Fetch the list on the server so the table paints populated on first response,
// instead of shipping JS → hydrating → fetching on the client. The page re-runs
// (and re-fetches) on every `router.refresh()` after a mutation.
export default async function MasterBusinessPage() {
  let initialBusinesses: Business[] = [];
  let error: string | null = null;
  try {
    initialBusinesses = await listBusinesses();
  } catch {
    error = "Failed to load businesses.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Business" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <BusinessListScreen
          initialBusinesses={initialBusinesses}
          error={error}
        />
      </div>
    </div>
  );
}
