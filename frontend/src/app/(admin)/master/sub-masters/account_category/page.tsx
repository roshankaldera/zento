import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listAccountCategories } from "@/lib/account-category-service";
import type { AccountCategory } from "@/types/account-category";
import { AccountCategoryListScreen } from "./components/account-category-list";

export const metadata: Metadata = {
  title: "Account Category | Zento",
  description: "Zento Account Category master list",
};

// Fetch the list on the server so the table paints populated on first response,
// instead of shipping JS → hydrating → fetching on the client. The page re-runs
// (and re-fetches) on every `router.refresh()` after a mutation.
export default async function MasterSubMastersAccountCategoryPage() {
  let initialAccountCategories: AccountCategory[] = [];
  let error: string | null = null;
  try {
    initialAccountCategories = await listAccountCategories();
  } catch {
    error = "Failed to load account categories.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Account Category" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <AccountCategoryListScreen
          initialAccountCategories={initialAccountCategories}
          error={error}
        />
      </div>
    </div>
  );
}
