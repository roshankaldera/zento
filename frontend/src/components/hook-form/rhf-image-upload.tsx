"use client"

import * as React from "react"
import { useDropzone, type Accept } from "react-dropzone"
import { ImageIcon, XIcon } from "lucide-react"
import type { FieldPath, FieldValues } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { RHFField } from "./rhf-field"
import { toArray } from "./utils"
import type { BaseFieldProps } from "./types"

const IMAGE_ACCEPT: Accept = {
  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".svg"],
}

export interface RHFImageUploadProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
  multiple?: boolean
  maxSize?: number
  maxFiles?: number
  dropzoneText?: string
}

/**
 * Image upload with thumbnail previews (react-dropzone). The field value is a
 * `File` (single) or `File[]` (multiple). Object URLs are created for previews
 * and revoked on unmount/replacement to avoid memory leaks.
 */
export function RHFImageUpload<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  disabled,
  required,
  className,
  rules,
  multiple = false,
  maxSize,
  maxFiles,
  dropzoneText = "Drop an image here, or click to browse",
}: RHFImageUploadProps<TFieldValues, TName>) {
  return (
    <RHFField<TFieldValues, TName>
      name={name}
      label={label}
      description={description}
      disabled={disabled}
      required={required}
      className={className}
      rules={rules}
      withControl={false}
    >
      {({ field }) => {
        const files = toArray<File>(field.value)
        const setFiles = (next: File[]) => {
          field.onChange(multiple ? next : (next[0] ?? undefined))
          field.onBlur()
        }
        return (
          <ImageDropzone
            multiple={multiple}
            maxSize={maxSize}
            maxFiles={maxFiles}
            disabled={disabled ?? field.disabled}
            dropzoneText={dropzoneText}
            files={files}
            onAccepted={(accepted) =>
              setFiles(multiple ? [...files, ...accepted] : accepted)
            }
            onRemove={(idx) => setFiles(files.filter((_, i) => i !== idx))}
          />
        )
      }}
    </RHFField>
  )
}

function ImageDropzone({
  multiple,
  maxSize,
  maxFiles,
  disabled,
  dropzoneText,
  files,
  onAccepted,
  onRemove,
}: {
  multiple?: boolean
  maxSize?: number
  maxFiles?: number
  disabled?: boolean
  dropzoneText: string
  files: File[]
  onAccepted: (files: File[]) => void
  onRemove: (index: number) => void
}) {
  // Derive object URLs from files and revoke them when the set changes/unmounts.
  const previews = React.useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files]
  )
  React.useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url))
  }, [previews])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: IMAGE_ACCEPT,
    multiple,
    maxSize,
    maxFiles,
    disabled,
    onDrop: (accepted) => accepted.length && onAccepted(accepted),
  })

  return (
    <div className="grid gap-3">
      <div
        {...getRootProps()}
        className={cn(
          "border-input hover:bg-accent/50 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center transition-colors",
          isDragActive && "border-primary bg-accent/50",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <ImageIcon className="text-muted-foreground size-6" />
        <p className="text-muted-foreground text-sm">{dropzoneText}</p>
      </div>

      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {previews.map((p, idx) => (
            <div
              key={`${p.file.name}-${idx}`}
              className="group relative size-24 overflow-hidden rounded-md border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.file.name}
                className="size-full object-cover"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                disabled={disabled}
                onClick={() => onRemove(idx)}
                aria-label={`Remove ${p.file.name}`}
                className="absolute right-1 top-1 size-6 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <XIcon className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
