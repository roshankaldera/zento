import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listInventories } from "@/lib/inventory-service";
import type { Inventory } from "@/types/inventory";
import { InventoryListScreen } from "./components/inventory-list";

export const metadata: Metadata = {
  title: "Inventory | Zento",
  description: "Zento inventory items",
};

export default async function MasterInventoryPage() {
  let initialInventories: Inventory[] = [];
  let error: string | null = null;
  try {
    initialInventories = await listInventories();
  } catch {
    error = "Failed to load inventory.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Inventory" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <InventoryListScreen
          initialInventories={initialInventories}
          error={error}
        />
      </div>
    </div>
  );
}
