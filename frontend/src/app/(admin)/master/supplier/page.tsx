import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listSuppliers } from "@/lib/supplier-service";
import type { Supplier } from "@/types/supplier";
import { SupplierListScreen } from "./components/supplier-list";

export const metadata: Metadata = {
  title: "Supplier | Zento",
  description: "Zento supplier master records",
};

export default async function MasterSupplierPage() {
  let initialSuppliers: Supplier[] = [];
  let error: string | null = null;
  try {
    initialSuppliers = await listSuppliers();
  } catch {
    error = "Failed to load suppliers.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Supplier" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <SupplierListScreen initialSuppliers={initialSuppliers} error={error} />
      </div>
    </div>
  );
}
