import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { getInventoryGroup } from "@/lib/inventory-group-service";
import { InventoryGroupForm } from "../../components/inventory-group-form";
import { toInventoryGroupFormValues } from "../../components/inventory-group-schema";
import { INVENTORY_GROUP_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Inventory Group | Zento",
  description: "Update an existing inventory group",
};

// Fetch the record on the server so the form pre-fills on first paint — no
// client fetch-on-mount and no skeleton flash.
export default async function EditInventoryGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inventoryGroup = Number.isFinite(Number(id))
    ? await getInventoryGroup(Number(id))
    : undefined;

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Inventory Group" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {inventoryGroup ? (
          <InventoryGroupForm
            mode="edit"
            inventoryGroupId={inventoryGroup.id}
            defaultValues={toInventoryGroupFormValues(inventoryGroup)}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This inventory group could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={INVENTORY_GROUP_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
