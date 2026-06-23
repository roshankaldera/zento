import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listAccounts } from "@/lib/account-service";
import type { Account } from "@/types/account";
import { AccountListScreen } from "./components/account-list";

export const metadata: Metadata = {
  title: "Account | Zento",
  description: "Zento account master records",
};

export default async function MasterAccountPage() {
  let initialAccounts: Account[] = [];
  let error: string | null = null;
  try {
    initialAccounts = await listAccounts();
  } catch {
    error = "Failed to load accounts.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Account" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <AccountListScreen initialAccounts={initialAccounts} error={error} />
      </div>
    </div>
  );
}
