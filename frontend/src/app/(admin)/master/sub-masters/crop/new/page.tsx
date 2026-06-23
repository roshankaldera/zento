import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { CropForm } from "../components/crop-form";
import { cropFormDefaults } from "../components/crop-schema";

export const metadata: Metadata = {
  title: "New Crop | Zento",
  description: "Add a new crop",
};

export default function NewCropPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="New Crop" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <CropForm mode="create" defaultValues={cropFormDefaults} />
      </div>
    </div>
  );
}
