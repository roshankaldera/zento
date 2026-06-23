/**
 * Mock domain types + data for the DataTable examples. In a real app these
 * types live in your domain layer and the data comes from your API client.
 */

export interface Customer {
  id: string
  code: string
  customerName: string
  email: string
  phone: string
  city: string
  balance: number
  status: "active" | "inactive" | "blocked"
  createdAt: Date
}

export interface Supplier {
  id: string
  code: string
  supplierName: string
  contactPerson: string
  email: string
  category: string
  payable: number
  status: "active" | "on-hold" | "inactive"
}

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    code: "CUST-0001",
    customerName: "Acme Trading LLC",
    email: "accounts@acme.example",
    phone: "+971 50 123 4567",
    city: "Dubai",
    balance: 12450.5,
    status: "active",
    createdAt: new Date("2025-01-12"),
  },
  {
    id: "c2",
    code: "CUST-0002",
    customerName: "Globex Industries",
    email: "ap@globex.example",
    phone: "+971 4 555 0199",
    city: "Abu Dhabi",
    balance: -320.0,
    status: "active",
    createdAt: new Date("2025-02-03"),
  },
  {
    id: "c3",
    code: "CUST-0003",
    customerName: "Initech Solutions",
    email: "finance@initech.example",
    phone: "+971 55 998 1122",
    city: "Sharjah",
    balance: 0,
    status: "inactive",
    createdAt: new Date("2025-02-21"),
  },
  {
    id: "c4",
    code: "CUST-0004",
    customerName: "Umbrella Retail",
    email: "billing@umbrella.example",
    phone: "+971 56 222 7788",
    city: "Dubai",
    balance: 88000,
    status: "blocked",
    createdAt: new Date("2025-03-15"),
  },
  {
    id: "c5",
    code: "CUST-0005",
    customerName: "Stark Holdings",
    email: "pay@stark.example",
    phone: "+971 50 777 3344",
    city: "Dubai",
    balance: 4520.75,
    status: "active",
    createdAt: new Date("2025-04-02"),
  },
]

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: "s1",
    code: "SUP-0001",
    supplierName: "Emirates Steel Co.",
    contactPerson: "Khalid A.",
    email: "sales@emsteel.example",
    category: "Raw Materials",
    payable: 54200,
    status: "active",
  },
  {
    id: "s2",
    code: "SUP-0002",
    supplierName: "Gulf Logistics",
    contactPerson: "Sara M.",
    email: "ops@gulflog.example",
    category: "Services",
    payable: 8900,
    status: "on-hold",
  },
  {
    id: "s3",
    code: "SUP-0003",
    supplierName: "Nile Packaging",
    contactPerson: "Omar F.",
    email: "orders@nilepack.example",
    category: "Packaging",
    payable: 0,
    status: "inactive",
  },
]

const currency = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  minimumFractionDigits: 2,
})

export const formatCurrency = (value: number) => currency.format(value)

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
