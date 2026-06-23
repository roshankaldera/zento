import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { AccountCategoryForm } from "../components/account-category-form";
import { accountCategoryFormDefaults } from "../components/account-category-schema";

export const metadata: Metadata = {
  title: "New Account Category | Zento",
  description: "Add a new account category",
};

export default function NewAccountCategoryPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="New Account Category" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <AccountCategoryForm
          mode="create"
          defaultValues={accountCategoryFormDefaults}
        />
      </div>
    </div>
  );
}
