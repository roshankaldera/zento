import { Metadata } from "next";
import React from "react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ProfileForms } from "./components/profile-forms";

export const metadata: Metadata = {
  title: "Profile | Zento",
  description: "Manage your profile details and password",
};

export default function Profile() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Profile" />
      <ProfileForms />
    </div>
  );
}
