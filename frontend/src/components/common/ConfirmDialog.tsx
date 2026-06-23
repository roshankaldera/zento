"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export type ConfirmVariant = "default" | "destructive"

export interface ConfirmOptions {
  title: string
  description?: React.ReactNode
  /** Label for the confirm button. Defaults to "Confirm". */
  confirmLabel?: string
  /** Label for the cancel button. Defaults to "Cancel". */
  cancelLabel?: string
  /** "destructive" renders the confirm button in the destructive palette. */
  variant?: ConfirmVariant
}

export interface ConfirmDialogProps extends ConfirmOptions {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
}

/**
 * Controlled confirmation dialog built on the shadcn AlertDialog primitive.
 * The caller owns the `open` state — use this for declarative call sites.
 * For ergonomic, promise-based prompts, prefer `useConfirm()` from
 * `@/components/common/ConfirmProvider`.
 */
function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              variant === "destructive" &&
                "bg-destructive text-white hover:bg-destructive/90"
            )}
            onClick={() => onConfirm()}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmDialog
