import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import type { Option } from "@/components/hook-form";
import { listBusinesses } from "@/lib/business-service";
import { BankForm } from "../components/bank-form";
import { bankFormDefaults } from "../components/bank-schema";

export const metadata: Metadata = {
  title: "New Bank | Zento",
  description: "Add a new bank",
};

// Fetch the business list on the server to populate the FK select.
export default async function NewBankPage() {
  const businesses = await listBusinesses().catch(() => []);
  const businessOptions: Option[] = businesses.map((b) => ({
    label: b.name,
    value: String(b.id),
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="New Bank" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <BankForm
          mode="create"
          defaultValues={bankFormDefaults}
          businessOptions={businessOptions}
        />
      </div>
    </div>
  );
}
