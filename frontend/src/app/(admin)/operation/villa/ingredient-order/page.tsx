import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import type { Option } from "@/components/hook-form";
import { listKots } from "@/lib/kot-service";
import { KotIngredientForm } from "./components/kot-ingredient-form";
import { kotIngredientFormDefaults } from "./components/kot-ingredient-schema";

export const metadata: Metadata = {
  title: "New Ingredient Order | Zento",
  description: "Add a new KOT ingredient order",
};

export default async function OperationVillaIngredientOrderPage() {
  const kots = await listKots().catch(() => []);
  const kotOptions: Option[] = kots.map((k) => ({
    label: `#${k.id} — ${k.booking?.customer ?? "—"} (${k.requestTime.slice(0, 10)})`,
    value: String(k.id),
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="New Ingredient Order" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <KotIngredientForm
          mode="create"
          defaultValues={kotIngredientFormDefaults}
          kotOptions={kotOptions}
        />
      </div>
    </div>
  );
}
