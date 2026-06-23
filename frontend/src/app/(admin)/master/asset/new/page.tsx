import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { AssetForm } from "../components/asset-form";
import { assetFormDefaults } from "../components/asset-schema";

export const metadata: Metadata = {
  title: "New Asset | Zento",
  description: "Add a new asset",
};

export default function NewAssetPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="New Asset" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <AssetForm mode="create" defaultValues={assetFormDefaults} />
      </div>
    </div>
  );
}
