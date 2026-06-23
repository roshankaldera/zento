"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ERPDataTable } from "@/components/data-table"
import { deleteUser } from "@/lib/user-service"
import type { User } from "@/types/user"
import { getUserColumns } from "./user-columns"
import { USER_NEW_PATH, userEditPath } from "./constants"

interface UserListScreenProps {
  initialUsers: User[]
  error?: string | null
}

export function UserListScreen({
  initialUsers,
  error = null,
}: UserListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(USER_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (user: User) => {
      await deleteUser(user.id)
      refresh()
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getUserColumns({
        onEdit: (user) => router.push(userEditPath(user.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Users"
      description="Manage user accounts and business access."
      columns={columns}
      data={initialUsers}
      loading={isPending}
      error={error}
      getRowId={(u) => String(u.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="users"
      searchPlaceholder="Search by name or user name..."
      emptyMessage="No users yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(USER_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
