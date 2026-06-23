import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { InventoryGroupForm } from "../components/inventory-group-form";
import { inventoryGroupFormDefaults } from "../components/inventory-group-schema";

export const metadata: Metadata = {
  title: "New Inventory Group | Zento",
  description: "Add a new inventory group",
};

export default function NewInventoryGroupPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="New Inventory Group" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <InventoryGroupForm
          mode="create"
          defaultValues={inventoryGroupFormDefaults}
        />
      </div>
    </div>
  );
}
