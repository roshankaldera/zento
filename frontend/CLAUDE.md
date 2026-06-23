# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Zento is an ERP / back-office dashboard (Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4). It is built on the TailAdmin template and extended with a custom domain model. Functional areas (Home dashboards, Financial, Operation, Masters) and their routes are documented in [README.md](README.md); the navigation tree is the source of truth in [src/layout/AppSidebar.tsx](src/layout/AppSidebar.tsx).

## Commands

```bash
npm run dev      # dev server (http://localhost:3000)
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint (next/core-web-vitals + next/typescript)
npx tsc --noEmit # typecheck (no test framework is configured)
```

There is no test runner in this repo. Verify changes with `npx tsc --noEmit` and `npm run lint`.

Add shadcn/ui components with `npx shadcn@latest add <name>`; the shadcn MCP server is configured in [.mcp.json](.mcp.json). Project config lives in [components.json](components.json) (radix-nova style, neutral base, lucide icons, aliases `@/components`, `@/components/ui`, `@/lib/utils`).

## Architecture

**Route groups.** All authenticated pages live under `src/app/(admin)/` (a pathless group). `(admin)/layout.tsx` is a client component that renders `AppSidebar` + `AppHeader` and shifts main-content margin based on sidebar state. Auth/error screens live under `(full-width-pages)/`. Pages are server components by default; most follow the `PageBreadcrumb` + card-content pattern (see any `(admin)/**/page.tsx`).

**Global providers.** `src/app/layout.tsx` wraps everything in `ThemeProvider` → `SidebarProvider` (both in `src/context/`). `ThemeContext` toggles dark mode by adding/removing `.dark` on `document.documentElement` and persisting to `localStorage`; consume via `useTheme()`. `SidebarContext` (`useSidebar()`) owns expand/hover/mobile state that layout, header, and sidebar all read.

**Two coexisting styling systems** — this is the most important thing to get right when adding UI:
- **TailAdmin theme** — custom design tokens in the first `@theme` block of [src/app/globals.css](src/app/globals.css): `brand-*`, `error-*`, `text-theme-*`, `text-title-*` etc. Used by all legacy TailAdmin components and existing pages (`text-brand-500`, `bg-gray-900`, …).
- **shadcn tokens** — semantic CSS variables (`--background`, `--primary`, `--destructive`, `--border`, …) defined in the `@theme inline` + `:root`/`.dark` blocks lower in the same file. Used by everything under `src/components/ui/` and the hook-form library.

Both render correctly in light/dark, but they are different palettes. New shadcn components use neutral semantic tokens, **not** the TailAdmin `brand-*` blue — don't assume a shadcn `Button` matches a TailAdmin one. When replacing TailAdmin components, expect a visual palette shift unless you explicitly map tokens.

**Forms.** Use the React Hook Form library at [src/components/hook-form/](src/components/hook-form/README.md) for any new form. Every field reads the form via `useFormContext()` (no `control` prop); the `RHFField` wrapper in `rhf-field.tsx` is the single source of label/description/error/Controller chrome, and `RHFForm` wraps `FormProvider` + `<form>`. Fields commit domain-typed values (number, Date, File, string[]) ready for Zod. Note `src/components/ui/form.tsx` was hand-authored because the radix-nova preset ships a `Field` primitive instead of the classic `form.tsx`.

**Icons.** Two sources: project SVGs in `src/icons/` are imported as React components (via SVGR) and re-exported from [src/icons/index.tsx](src/icons/index.tsx) — import as `import { EyeIcon } from "@/icons"`. shadcn components use `lucide-react`. SVG-as-component is wired in both webpack and turbopack in [next.config.ts](next.config.ts); the `*.svg` module type is declared in `src/svg.d.ts`.

**Path alias.** `@/*` → `src/*` (tsconfig). Fonts: Geist (`--font-sans`) + Outfit, loaded in the root layout.
