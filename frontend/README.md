# Zento — Business Management & ERP Dashboard

Zento is a data-driven **ERP / back-office dashboard** built with **Next.js 16, React 19, TypeScript and Tailwind CSS v4**. It brings financial bookkeeping, day-to-day operations (employees, villa/hospitality, estate/agriculture, property, inventory) and master-data management together in one admin panel.

## Overview

Zento is organized into four functional areas, surfaced through the application sidebar:

- **Home** — executive dashboards (Cash Flow, Budget vs Actual, Profit & Loss) and a shared calendar.
- **Financial Transaction** — journal entries, cash transfers, reimbursements, recurring entries and budgeting.
- **Operation Transaction** — operational records across Employee, Villa, Estate, Investment, Property and Inventory.
- **Masters** — reference data (businesses, employees, suppliers, banks, accounts, assets, fleet, currencies, inventory, users) and sub-masters.

It is built on the [TailAdmin](https://tailadmin.com) Next.js dashboard template and extended with a custom domain model, an enterprise [React Hook Form component library](./src/components/hook-form/README.md), and [shadcn/ui](https://ui.shadcn.com) primitives.

## Tech Stack

| Area              | Technology                                                        |
| ----------------- | ----------------------------------------------------------------- |
| Framework         | Next.js 16 (App Router, React Server Components)                   |
| UI library        | React 19                                                          |
| Language          | TypeScript 5 (strict)                                              |
| Styling           | Tailwind CSS v4 (`@tailwindcss/postcss`), `tailwind-merge`         |
| Components         | shadcn/ui (radix-nova preset, `radix-ui`), TailAdmin UI            |
| Icons             | lucide-react, custom SVG icon set                                 |
| Forms             | React Hook Form v7, `@hookform/resolvers`, Zod                     |
| Inputs / masking  | `react-number-format` (currency/percent/number)                   |
| Date & time       | `react-day-picker` + `date-fns`                                   |
| Combobox / search | `cmdk`                                                            |
| File upload       | `react-dropzone`                                                  |
| Calendar          | FullCalendar (`@fullcalendar/*`)                                  |
| Drag & drop       | `react-dnd` + HTML5 backend                                       |
| Maps              | `@react-jvectormap`                                              |
| Carousel          | Swiper                                                            |

## Modules & Routes

Routes are grouped under the `(admin)` route group in `src/app`. The navigation is defined in [`src/layout/AppSidebar.tsx`](./src/layout/AppSidebar.tsx).

### Home
| Page             | Route                              |
| ---------------- | ---------------------------------- |
| Cash Flow        | `/home/dashboards/cash-flow`       |
| Budget vs Actual | `/home/dashboards/budget-vs-actual`|
| Profit and Loss  | `/home/dashboards/profit-and-loss` |
| Calendar         | `/home/calendar`                   |

### Financial Transaction
| Page          | Route                      |
| ------------- | -------------------------- |
| Journal       | `/financial/journal`       |
| Cash Transfer | `/financial/cash-transfer` |
| Reimbursement | `/financial/reimbursement` |
| Recurring     | `/financial/recurring`     |
| Budget        | `/financial/budget`        |

### Operation Transaction
| Group      | Page             | Route                                  |
| ---------- | ---------------- | -------------------------------------- |
| Employee   | Attendance       | `/operation/employee/attendance`       |
| Employee   | Leave            | `/operation/employee/leave`            |
| Employee   | Loan             | `/operation/employee/loan`             |
| Employee   | Salary           | `/operation/employee/salary`           |
| Villa      | Booking          | `/operation/villa/booking`             |
| Villa      | KOT              | `/operation/villa/kot`                 |
| Villa      | Ingredient Order | `/operation/villa/ingredient-order`    |
| Estate     | Coconut Harvest  | `/operation/estate/coconut-harvest`    |
| Estate     | Latex Harvest    | `/operation/estate/latex-harvest`      |
| Estate     | Other Harvest    | `/operation/estate/other-harvest`      |
| Investment | Investment       | `/operation/investment/investment`     |
| Property   | Rent             | `/operation/property/rent`             |
| Property   | Solar            | `/operation/property/solar`            |
| Inventory  | Item Transaction | `/operation/inventory/item-transaction`|

### Masters
| Page             | Route                                     |
| ---------------- | ----------------------------------------- |
| Business         | `/master/business`                        |
| Employee         | `/master/employee`                        |
| Supplier         | `/master/supplier`                        |
| Bank             | `/master/bank`                            |
| Account          | `/master/account`                         |
| Asset            | `/master/asset`                           |
| Fleet            | `/master/fleet`                           |
| Currency         | `/master/currency`                        |
| Inventory        | `/master/inventory`                       |
| User             | `/master/user`                            |
| Crop             | `/master/sub-masters/crop`                |
| Account Category | `/master/sub-masters/account_category`    |
| Inventory Group  | `/master/sub-masters/inventory_group`     |

## Project Structure

```
src/
├── app/
│   ├── (admin)/              # authenticated dashboard route group
│   │   ├── home/             # dashboards + calendar
│   │   ├── financial/        # journal, cash-transfer, reimbursement, recurring, budget
│   │   ├── operation/        # employee, villa, estate, investment, property, inventory
│   │   ├── master/           # master & sub-master data
│   │   └── (others-pages)/   # profile, misc pages
│   ├── (full-width-pages)/   # auth / error layouts
│   ├── globals.css           # Tailwind v4 theme + shadcn tokens
│   └── layout.tsx
├── components/
│   ├── hook-form/            # reusable RHF field library (see its README)
│   ├── ui/                   # shadcn/ui primitives
│   ├── auth/                 # sign-in / sign-up forms
│   └── …                     # charts, tables, forms, etc.
├── context/                  # Sidebar / Theme providers
├── icons/                    # custom SVG icon set
└── layout/                   # AppSidebar, AppHeader, layout shells
```

## Getting Started

### Prerequisites

- Node.js 20.x or later

### Install & run

```bash
npm install
# Use --legacy-peer-deps if you hit a peer-dependency error
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command         | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Start the dev server              |
| `npm run build` | Production build                  |
| `npm run start` | Run the production build          |
| `npm run lint`  | Lint with ESLint                  |

## Forms

Zento ships a strongly-typed React Hook Form component library at [`src/components/hook-form`](./src/components/hook-form/README.md) — context-driven RHF wrappers (inputs, selects, date/range/time pickers, currency/percentage, file/image upload) built on shadcn/ui with Zod-ready values and automatic dark-mode support.

## License

Released under the MIT License. Built on the [TailAdmin](https://github.com/TailAdmin/free-nextjs-admin-dashboard) Next.js template (MIT).
