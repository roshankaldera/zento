import type { Option } from "./types"

/**
 * Shared, side-effect-free helpers for the RHF wrappers. Kept pure so they can
 * be unit-tested and reused across components without pulling React in.
 */

/** Type guard distinguishing an `Option` object from a primitive value. */
export function isOption<T>(value: unknown): value is Option<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    "label" in value
  )
}

/**
 * Normalize a mixed list (strings or Option objects) into `Option`s so callers
 * may pass `["a", "b"]` or `[{ label, value }]` interchangeably.
 */
export function normalizeOptions<T = string>(
  options: ReadonlyArray<Option<T> | T>
): Option<T>[] {
  return options.map((opt) =>
    isOption<T>(opt) ? opt : { label: String(opt), value: opt }
  )
}

/** Find the option matching a value (referential or `===`). */
export function findOption<T>(
  options: Option<T>[],
  value: T | undefined | null
): Option<T> | undefined {
  if (value === undefined || value === null) return undefined
  return options.find((o) => o.value === value)
}

/** Human-readable file size, e.g. `1.4 MB`. */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/** Accept-string / size validation result. */
export interface FileValidationOptions {
  accept?: string
  maxSize?: number
  maxFiles?: number
}

/** Validate a File against an accept pattern + max size. Returns an error or null. */
export function validateFile(
  file: File,
  { accept, maxSize }: FileValidationOptions
): string | null {
  if (maxSize && file.size > maxSize) {
    return `${file.name} exceeds the ${formatBytes(maxSize)} limit`
  }
  if (accept) {
    const patterns = accept.split(",").map((p) => p.trim().toLowerCase())
    const name = file.name.toLowerCase()
    const type = file.type.toLowerCase()
    const ok = patterns.some((p) => {
      if (p.startsWith(".")) return name.endsWith(p)
      if (p.endsWith("/*")) return type.startsWith(p.slice(0, -1))
      return type === p
    })
    if (!ok) return `${file.name} is not an accepted file type`
  }
  return null
}

/** Coerce an arbitrary value to an array (for multi-value fields). */
export function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return []
  return Array.isArray(value) ? value : [value]
}
