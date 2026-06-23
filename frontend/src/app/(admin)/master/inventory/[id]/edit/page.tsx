import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import type { Option } from "@/components/hook-form";
import { Button } from "@/components/ui/button";
import { listBusinesses } from "@/lib/business-service";
import { getInventory } from "@/lib/inventory-service";
import { InventoryForm } from "../../components/inventory-form";
import { toInventoryFormValues } from "../../components/inventory-schema";
import { INVENTORY_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Inventory | Zento",
  description: "Update an existing inventory item",
};

export default async function EditInventoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [inventory, businesses] = await Promise.all([
    Number.isFinite(Number(id)) ? getInventory(Number(id)) : undefined,
    listBusinesses().catch(() => []),
  ]);
  const businessOptions: Option[] = businesses.map((b) => ({
    label: b.name,
    value: String(b.id),
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Inventory" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {inventory ? (
          <InventoryForm
            mode="edit"
            inventoryId={inventory.id}
            defaultValues={toInventoryFormValues(inventory)}
            businessOptions={businessOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This inventory item could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={INVENTORY_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
