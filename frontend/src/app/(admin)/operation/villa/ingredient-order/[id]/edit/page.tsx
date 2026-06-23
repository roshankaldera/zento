import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import type { Option } from "@/components/hook-form";
import { Button } from "@/components/ui/button";
import { listKots } from "@/lib/kot-service";
import { getKotIngredient } from "@/lib/kot-ingredient-service";
import { KotIngredientForm } from "../../components/kot-ingredient-form";
import { toKotIngredientFormValues } from "../../components/kot-ingredient-schema";
import { KOT_INGREDIENT_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Ingredient Order | Zento",
  description: "Update an existing KOT ingredient order",
};

export default async function EditKotIngredientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [kotIngredient, kots] = await Promise.all([
    Number.isFinite(Number(id)) ? getKotIngredient(Number(id)) : undefined,
    listKots().catch(() => []),
  ]);
  const kotOptions: Option[] = kots.map((k) => ({
    label: `#${k.id} — ${k.booking?.customer ?? "—"} (${k.requestTime.slice(0, 10)})`,
    value: String(k.id),
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Ingredient Order" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {kotIngredient ? (
          <KotIngredientForm
            mode="edit"
            kotIngredientId={kotIngredient.id}
            defaultValues={toKotIngredientFormValues(kotIngredient)}
            kotOptions={kotOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This ingredient order could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={KOT_INGREDIENT_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
