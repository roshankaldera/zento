import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { getAccountCategory } from "@/lib/account-category-service";
import { AccountCategoryForm } from "../../components/account-category-form";
import { toAccountCategoryFormValues } from "../../components/account-category-schema";
import { ACCOUNT_CATEGORY_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Account Category | Zento",
  description: "Update an existing account category",
};

// Fetch the record on the server so the form pre-fills on first paint — no
// client fetch-on-mount and no skeleton flash.
export default async function EditAccountCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const accountCategory = Number.isFinite(Number(id))
    ? await getAccountCategory(Number(id))
    : undefined;

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Account Category" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {accountCategory ? (
          <AccountCategoryForm
            mode="edit"
            accountCategoryId={accountCategory.id}
            defaultValues={toAccountCategoryFormValues(accountCategory)}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This account category could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={ACCOUNT_CATEGORY_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
