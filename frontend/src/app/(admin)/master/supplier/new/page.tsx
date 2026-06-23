import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { SupplierForm } from "../components/supplier-form";
import { supplierFormDefaults } from "../components/supplier-schema";

export const metadata: Metadata = {
  title: "New Supplier | Zento",
  description: "Add a new supplier",
};

export default function NewSupplierPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="New Supplier" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <SupplierForm mode="create" defaultValues={supplierFormDefaults} />
      </div>
    </div>
  );
}
