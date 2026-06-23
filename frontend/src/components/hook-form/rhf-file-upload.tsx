"use client"

import * as React from "react"
import { useDropzone, type Accept } from "react-dropzone"
import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react"
import type { FieldPath, FieldValues } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { RHFField } from "./rhf-field"
import { formatBytes, toArray } from "./utils"
import type { BaseFieldProps } from "./types"

export interface RHFFileUploadProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
  /** react-dropzone accept map, e.g. `{ "application/pdf": [".pdf"] }`. */
  accept?: Accept
  /** Allow selecting multiple files. Value becomes `File[]`; else a single `File`. */
  multiple?: boolean
  /** Max size per file in bytes. */
  maxSize?: number
  /** Max number of files (multiple only). */
  maxFiles?: number
  dropzoneText?: string
}

/**
 * Drag-and-drop file upload bound to RHF (react-dropzone). The field value is
 * a `File` (single) or `File[]` (multiple). Persist by uploading these in your
 * submit handler; validate size/type with the props or a Zod schema.
 */
export function RHFFileUpload<
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
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  dropzoneText = "Drag & drop files here, or click to browse",
}: RHFFileUploadProps<TFieldValues, TName>) {
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
          <FileDropzone
            accept={accept}
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

/** Stateless dropzone UI — kept separate so it has no RHF coupling. */
function FileDropzone({
  accept,
  multiple,
  maxSize,
  maxFiles,
  disabled,
  dropzoneText,
  files,
  onAccepted,
  onRemove,
}: {
  accept?: Accept
  multiple?: boolean
  maxSize?: number
  maxFiles?: number
  disabled?: boolean
  dropzoneText: string
  files: File[]
  onAccepted: (files: File[]) => void
  onRemove: (index: number) => void
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
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
        <UploadCloudIcon className="text-muted-foreground size-6" />
        <p className="text-muted-foreground text-sm">{dropzoneText}</p>
        {maxSize && (
          <p className="text-muted-foreground text-xs">
            Max {formatBytes(maxSize)} per file
          </p>
        )}
      </div>

      {files.length > 0 && (
        <ul className="grid gap-2">
          {files.map((file, idx) => (
            <li
              key={`${file.name}-${idx}`}
              className="bg-muted/40 flex items-center gap-3 rounded-md border px-3 py-2"
            >
              <FileIcon className="text-muted-foreground size-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{file.name}</p>
                <p className="text-muted-foreground text-xs">
                  {formatBytes(file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={disabled}
                onClick={() => onRemove(idx)}
                aria-label={`Remove ${file.name}`}
              >
                <XIcon className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
