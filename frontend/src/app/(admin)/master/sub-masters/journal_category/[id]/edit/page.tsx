import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { getJournalCategory } from "@/lib/journal-category-service";
import { JournalCategoryForm } from "../../components/journal-category-form";
import { toJournalCategoryFormValues } from "../../components/journal-category-schema";
import { JOURNAL_CATEGORY_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Journal Category | Zento",
  description: "Update an existing journal category",
};

// Fetch the record on the server so the form pre-fills on first paint — no
// client fetch-on-mount and no skeleton flash.
export default async function EditJournalCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const journalCategory = Number.isFinite(Number(id))
    ? await getJournalCategory(Number(id))
    : undefined;

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Journal Category" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {journalCategory ? (
          <JournalCategoryForm
            mode="edit"
            journalCategoryId={journalCategory.id}
            defaultValues={toJournalCategoryFormValues(journalCategory)}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This journal category could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={JOURNAL_CATEGORY_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
