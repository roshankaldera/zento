import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listBanks } from "@/lib/bank-service";
import type { Bank } from "@/types/bank";
import { BankListScreen } from "./components/bank-list";

export const metadata: Metadata = {
  title: "Bank | Zento",
  description: "Zento Bank master list",
};

// Fetch the list on the server so the table paints populated on first response,
// instead of shipping JS → hydrating → fetching on the client. The page re-runs
// (and re-fetches) on every `router.refresh()` after a mutation.
export default async function MasterBankPage() {
  let initialBanks: Bank[] = [];
  let error: string | null = null;
  try {
    initialBanks = await listBanks();
  } catch {
    error = "Failed to load banks.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Bank" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <BankListScreen initialBanks={initialBanks} error={error} />
      </div>
    </div>
  );
}
