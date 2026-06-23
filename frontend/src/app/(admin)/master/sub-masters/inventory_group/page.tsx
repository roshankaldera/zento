import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listInventoryGroups } from "@/lib/inventory-group-service";
import type { InventoryGroup } from "@/types/inventory-group";
import { InventoryGroupListScreen } from "./components/inventory-group-list";

export const metadata: Metadata = {
  title: "Inventory Group | Zento",
  description: "Zento Inventory Group master list",
};

// Fetch the list on the server so the table paints populated on first response,
// instead of shipping JS → hydrating → fetching on the client. The page re-runs
// (and re-fetches) on every `router.refresh()` after a mutation.
export default async function MasterSubMastersInventoryGroupPage() {
  let initialInventoryGroups: InventoryGroup[] = [];
  let error: string | null = null;
  try {
    initialInventoryGroups = await listInventoryGroups();
  } catch {
    error = "Failed to load inventory groups.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Inventory Group" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <InventoryGroupListScreen
          initialInventoryGroups={initialInventoryGroups}
          error={error}
        />
      </div>
    </div>
  );
}
