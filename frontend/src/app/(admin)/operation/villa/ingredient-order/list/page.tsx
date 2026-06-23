import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listKotIngredients } from "@/lib/kot-ingredient-service";
import type { KotIngredient } from "@/types/kot-ingredient";
import { KotIngredientListScreen } from "../components/kot-ingredient-list";

export const metadata: Metadata = {
  title: "Ingredient Order | Zento",
  description: "Zento KOT ingredient orders",
};

export default async function OperationVillaIngredientOrderListPage() {
  let initialKotIngredients: KotIngredient[] = [];
  let error: string | null = null;
  try {
    initialKotIngredients = await listKotIngredients();
  } catch {
    error = "Failed to load ingredient orders.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Ingredient Order" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <KotIngredientListScreen
          initialKotIngredients={initialKotIngredients}
          error={error}
        />
      </div>
    </div>
  );
}
