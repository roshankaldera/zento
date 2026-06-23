import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { JournalCategoryForm } from "../components/journal-category-form";
import { journalCategoryFormDefaults } from "../components/journal-category-schema";

export const metadata: Metadata = {
  title: "New Journal Category | Zento",
  description: "Add a new journal category",
};

export default function NewJournalCategoryPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="New Journal Category" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <JournalCategoryForm
          mode="create"
          defaultValues={journalCategoryFormDefaults}
        />
      </div>
    </div>
  );
}
