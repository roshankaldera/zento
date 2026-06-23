"use client"

import * as React from "react"
import {
  type FieldValues,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form"

import { Form } from "@/components/ui/form"

export interface RHFFormProps<TFieldValues extends FieldValues>
  extends Omit<React.ComponentProps<"form">, "onSubmit" | "onError"> {
  /** The instance returned by `useForm()`. */
  form: UseFormReturn<TFieldValues>
  /** Valid-submit handler; receives parsed, typed values. */
  onSubmit: SubmitHandler<TFieldValues>
  /** Optional invalid-submit handler for focusing/reporting errors. */
  onError?: SubmitErrorHandler<TFieldValues>
  children: React.ReactNode
}

/**
 * Wraps RHF's FormProvider and a native <form>, so child RHF components read
 * the form via `useFormContext()` (no `control` prop drilling). Keeps the
 * submit wiring in one place for consistency across the app.
 */
export function RHFForm<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  onError,
  children,
  ...formProps
}: RHFFormProps<TFieldValues>) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} {...formProps}>
        {children}
      </form>
    </Form>
  )
}
