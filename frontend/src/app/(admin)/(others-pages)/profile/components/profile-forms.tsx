"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  RHFForm,
  RHFInput,
  RHFPasswordInput,
  RHFTextarea,
} from "@/components/hook-form"
import { useAuth } from "@/context/AuthContext"
import { setStoredUser } from "@/lib/auth-service"
import {
  changePassword,
  getProfile,
  IncorrectPasswordError,
  updateProfile,
} from "@/lib/profile-service"
import type { User } from "@/types/user"
import {
  passwordFormDefaults,
  passwordSchema,
  profileSchema,
  type PasswordFormValues,
  type ProfileFormValues,
} from "./profile-schema"

/**
 * The signed-in user's self-service profile screen. Loads the current user
 * from the API, then renders two independent cards — editing details and
 * changing the password are submitted separately, each with its own Save.
 */
export function ProfileForms() {
  const [profile, setProfile] = React.useState<User | null>(null)
  const [loadError, setLoadError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true
    getProfile()
      .then((user) => {
        if (active) setProfile(user)
      })
      .catch(() => {
        if (active) setLoadError("Could not load your profile.")
      })
    return () => {
      active = false
    }
  }, [])

  if (loadError) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-destructive" role="alert">
            {loadError}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <div className="grid gap-6">
        <Card>
          <CardContent className="grid gap-4 py-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-full max-w-xl" />
            <Skeleton className="h-20 w-full max-w-xl" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <ProfileDetailsCard profile={profile} onUpdated={setProfile} />
      <ChangePasswordCard />
    </div>
  )
}

function ProfileDetailsCard({
  profile,
  onUpdated,
}: {
  profile: User
  onUpdated: (user: User) => void
}) {
  const { setUser } = useAuth()
  const [saved, setSaved] = React.useState(false)
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: profile.fullName,
      remark: profile.remark ?? "",
    },
  })

  const onSubmit = React.useCallback(
    async (values: ProfileFormValues) => {
      setSaved(false)
      try {
        const updated = await updateProfile({
          fullName: values.fullName,
          remark: values.remark,
        })
        // Keep the header/menu and the persisted session in sync.
        setUser(updated)
        setStoredUser(updated)
        onUpdated(updated)
        form.reset({
          fullName: updated.fullName,
          remark: updated.remark ?? "",
        })
        setSaved(true)
      } catch {
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [form, setUser, onUpdated],
  )

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Details</CardTitle>
        <CardDescription>Update your name and remark.</CardDescription>
      </CardHeader>
      <CardContent>
        <RHFForm form={form} onSubmit={onSubmit} className="grid max-w-xl gap-5">
          <RHFInput<ProfileFormValues>
            name="fullName"
            label="Full Name"
            required
            placeholder="Enter full name"
            maxLength={100}
          />
          <RHFTextarea<ProfileFormValues>
            name="remark"
            label="Remark"
            placeholder="Optional notes"
            maxLength={100}
            rows={3}
          />

          {rootError && (
            <p className="text-sm text-destructive" role="alert">
              {rootError}
            </p>
          )}
          {saved && (
            <p className="text-sm text-brand-500" role="status">
              Profile saved.
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save"}
            </Button>
          </div>
        </RHFForm>
      </CardContent>
    </Card>
  )
}

function ChangePasswordCard() {
  const [saved, setSaved] = React.useState(false)
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onBlur",
    defaultValues: passwordFormDefaults,
  })

  const onSubmit = React.useCallback(
    async (values: PasswordFormValues) => {
      setSaved(false)
      try {
        await changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        })
        form.reset(passwordFormDefaults)
        setSaved(true)
      } catch (error) {
        if (error instanceof IncorrectPasswordError) {
          form.setError("currentPassword", {
            type: "manual",
            message: error.message,
          })
          return
        }
        form.setError("root", {
          type: "manual",
          message: "Could not change your password. Please try again.",
        })
      }
    },
    [form],
  )

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Enter your current password and choose a new one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RHFForm form={form} onSubmit={onSubmit} className="grid max-w-xl gap-5">
          <RHFPasswordInput<PasswordFormValues>
            name="currentPassword"
            label="Current Password"
            required
            placeholder="Enter current password"
            maxLength={100}
          />
          <RHFPasswordInput<PasswordFormValues>
            name="newPassword"
            label="New Password"
            required
            placeholder="Enter new password"
            maxLength={100}
          />
          <RHFPasswordInput<PasswordFormValues>
            name="confirmPassword"
            label="Confirm Password"
            required
            placeholder="Re-enter new password"
            maxLength={100}
          />

          {rootError && (
            <p className="text-sm text-destructive" role="alert">
              {rootError}
            </p>
          )}
          {saved && (
            <p className="text-sm text-brand-500" role="status">
              Password changed.
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save"}
            </Button>
          </div>
        </RHFForm>
      </CardContent>
    </Card>
  )
}
