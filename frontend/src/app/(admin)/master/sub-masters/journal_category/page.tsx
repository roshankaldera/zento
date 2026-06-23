import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listJournalCategories } from "@/lib/journal-category-service";
import type { JournalCategory } from "@/types/journal-category";
import { JournalCategoryListScreen } from "./components/journal-category-list";

export const metadata: Metadata = {
  title: "Journal Category | Zento",
  description: "Zento Journal Category master list",
};

// Fetch the list on the server so the table paints populated on first response,
// instead of shipping JS → hydrating → fetching on the client. The page re-runs
// (and re-fetches) on every `router.refresh()` after a mutation.
export default async function MasterSubMastersJournalCategoryPage() {
  let initialJournalCategories: JournalCategory[] = [];
  let error: string | null = null;
  try {
    initialJournalCategories = await listJournalCategories();
  } catch {
    error = "Failed to load journal categories.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Journal Category" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <JournalCategoryListScreen
          initialJournalCategories={initialJournalCategories}
          error={error}
        />
      </div>
    </div>
  );
}
