import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import type { Option } from "@/components/hook-form";
import { listBusinesses } from "@/lib/business-service";
import { InventoryForm } from "../components/inventory-form";
import { inventoryFormDefaults } from "../components/inventory-schema";

export const metadata: Metadata = {
  title: "New Inventory | Zento",
  description: "Add a new inventory item",
};

export default async function NewInventoryPage() {
  const businesses = await listBusinesses().catch(() => []);
  const businessOptions: Option[] = businesses.map((b) => ({
    label: b.name,
    value: String(b.id),
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="New Inventory" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <InventoryForm
          mode="create"
          defaultValues={inventoryFormDefaults}
          businessOptions={businessOptions}
        />
      </div>
    </div>
  );
}
