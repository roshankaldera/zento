import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { BusinessForm } from "../components/business-form";
import { businessFormDefaults } from "../components/business-schema";

export const metadata: Metadata = {
  title: "New Business | Zento",
  description: "Add a new business",
};

export default function NewBusinessPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="New Business" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <BusinessForm mode="create" defaultValues={businessFormDefaults} />
      </div>
    </div>
  );
}
