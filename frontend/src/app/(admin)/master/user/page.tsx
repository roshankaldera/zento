import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listUsers } from "@/lib/user-service";
import type { User } from "@/types/user";
import { UserListScreen } from "./components/user-list";

export const metadata: Metadata = {
  title: "User | Zento",
  description: "Zento user accounts",
};

export default async function MasterUserPage() {
  let initialUsers: User[] = [];
  let error: string | null = null;
  try {
    initialUsers = await listUsers();
  } catch {
    error = "Failed to load users.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="User" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <UserListScreen initialUsers={initialUsers} error={error} />
      </div>
    </div>
  );
}
