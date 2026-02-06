# HomesteadHub Developer Guide

**Version 1.0** - Code Documentation & Architecture Overview

---

## Table of Contents

1. [Introduction](#introduction)
2. [Project Architecture](#project-architecture)
3. [Code Organization](#code-organization)
4. [Key Patterns & Conventions](#key-patterns--conventions)
5. [Module Deep Dives](#module-deep-dives)
6. [Adding New Features](#adding-new-features)
7. [Testing & Debugging](#testing--debugging)
8. [Common Tasks](#common-tasks)

---

## Introduction

### Purpose of This Guide

This guide helps developers (especially junior developers) navigate and understand the HomesteadHub codebase. Each major file includes inline comments explaining:

- **What** the code does (purpose and functionality)
- **Why** design decisions were made (architecture and trade-offs)
- **How** to use it (examples and patterns)
- **Where** to find related code (cross-references)

### Philosophy

**Well-documented code is maintainable code.** Comments should:

✅ **Explain the "why"** - Design decisions and business logic
✅ **Provide context** - How pieces fit together
✅ **Include examples** - Show proper usage
✅ **Link related files** - Guide navigation

❌ **Don't state the obvious** - `i++` doesn't need a comment
❌ **Don't over-explain** - Trust developers to understand basic concepts
❌ **Don't duplicate** - If the function name is clear, minimal comment needed

---

## Project Architecture

### Tech Stack

```
Frontend:
├── Next.js 14 (App Router) - React framework with SSR/SSG
├── TypeScript - Type safety and developer experience
├── Tailwind CSS - Utility-first styling
├── Radix UI - Accessible component primitives
└── React Query (@tanstack/react-query) - Data fetching (future)

Backend:
├── Next.js Server Actions - Server-side logic in App Router
├── Prisma - ORM and database management
├── SQLite (default) / PostgreSQL - Data persistence
├── bcrypt - Password hashing
└── Zod - Runtime validation

Development:
├── TypeScript - Static typing
├── ESLint - Code linting
└── Prisma Studio - Database GUI
```

### Architecture Patterns

**1. Server Components (Default)**
```typescript
// pages are Server Components by default
export default async function DashboardPage() {
  // Fetch data directly on server
  const items = await getStorageItems()
  return <div>{/* render */}</div>
}
```

**2. Client Components (Interactive)**
```typescript
"use client" // Required for hooks, state, events

export function InteractiveForm() {
  const [value, setValue] = useState("")
  return <input onChange={e => setValue(e.target.value)} />
}
```

**3. Server Actions (Backend Logic)**
```typescript
"use server" // Runs on server, callable from client

export async function createItem(data) {
  await db.storageItem.create({ data })
  revalidatePath("/dashboard")
  return { success: true }
}
```

### Data Flow

```
User Interaction
    ↓
Client Component (form, button)
    ↓
Server Action (validation, business logic)
    ↓
Database (Prisma ORM)
    ↓
Server Action (return result)
    ↓
Client Component (update UI)
    ↓
Server Component (revalidate & refresh)
```

---

## Code Organization

### Directory Structure

```
src/
├── actions/              # Server Actions (backend logic)
│   ├── auth.ts          # Authentication (PIN, sessions)
│   ├── onboarding.ts    # First-time user experience
│   ├── storage.ts       # Food storage CRUD operations
│   ├── tasks.ts         # Task management
│   ├── livestock.ts     # Animal tracking
│   ├── equipment.ts     # Equipment maintenance
│   ├── garden.ts        # Crop & planting management
│   ├── resources.ts     # Resource consumption tracking
│   ├── weather.ts       # Weather data logging
│   ├── preparedness.ts  # Emergency checklists
│   ├── notifications.ts # Alert generation
│   └── settings.ts      # App configuration

├── app/                 # Next.js App Router pages
│   ├── (auth)/          # Auth-related pages
│   │   ├── login/       # PIN login
│   │   └── setup/       # First-time PIN setup
│   │
│   ├── dashboard/       # Protected app pages
│   │   ├── layout.tsx   # Dashboard layout with sidebar
│   │   ├── page.tsx     # Main dashboard (overview)
│   │   ├── storage/     # Food storage module
│   │   ├── livestock/   # Animal management module
│   │   ├── equipment/   # Equipment tracking module
│   │   ├── garden/      # Garden planning module
│   │   ├── tasks/       # Task scheduling module
│   │   ├── resources/   # Resource tracking module
│   │   ├── weather/     # Weather logging module
│   │   ├── preparedness/ # Emergency prep module
│   │   ├── notifications/ # Alerts & notifications
│   │   └── settings/    # Configuration & preferences
│   │
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page

├── components/          # Reusable React components
│   ├── ui/              # Shadcn/Radix UI primitives
│   │   ├── dialog.tsx   # Modal dialogs
│   │   ├── button.tsx   # Button component
│   │   ├── select.tsx   # Dropdown selects
│   │   ├── progress.tsx # Progress bars
│   │   └── ...
│   │
│   ├── onboarding-tour.tsx  # 5-step guided tour
│   └── providers.tsx        # React Query provider

├── lib/                 # Utility functions & config
│   ├── db.ts            # Prisma client (singleton)
│   ├── utils.ts         # Helper functions (cn, formatDate, etc.)
│   └── validations.ts   # Zod schemas for data validation

└── types/               # TypeScript type definitions
    └── ...

prisma/
├── schema.prisma        # Database schema (well documented)
├── seed.ts              # Basic seed data
└── seed-starter-data.ts # Comprehensive example data

```

### File Naming Conventions

- **Pages**: `page.tsx` (Next.js convention)
- **Layouts**: `layout.tsx` (Next.js convention)
- **Components**: `kebab-case.tsx` (e.g., `onboarding-tour.tsx`)
- **Actions**: `module-name.ts` (e.g., `storage.ts`)
- **Types**: `PascalCase` for interfaces/types
- **Functions**: `camelCase` for functions and variables

---

## Key Patterns & Conventions

### 1. Server Actions Pattern

**Location**: `src/actions/`

Every action file follows this pattern:

```typescript
"use server" // Required directive

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { SomeSchema } from "@/lib/validations"

/**
 * Module documentation at top of file
 * Explains purpose, features, and relationships
 */

/**
 * Function-level documentation
 * @param data - Description of parameter
 * @returns Description of return value
 */
export async function createSomething(data: TypeHere) {
  try {
    // 1. Validate data
    const validData = SomeSchema.parse(data)

    // 2. Database operation
    await db.model.create({ data: validData })

    // 3. Revalidate affected pages
    revalidatePath("/dashboard/module")

    // 4. Return success
    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { success: false, error: "Message" }
  }
}
```

**Key Points**:
- Always validate with Zod schemas
- Always return `{ success, error? }` object
- Always revalidate affected paths
- Always catch and handle errors gracefully

### 2. Page Component Pattern

**Location**: `src/app/dashboard/*/page.tsx`

```typescript
/**
 * Page documentation
 * Explains what the page shows and how data flows
 */

// Server Component (no "use client")
export default async function ModulePage() {
  // Fetch data in parallel
  const [data1, data2] = await Promise.all([
    getDataSource1(),
    getDataSource2(),
  ])

  // Pass to Client Component for interactivity
  return <ModuleView initialData={data1} otherData={data2} />
}
```

**Key Points**:
- Server Components fetch data
- Client Components handle interactivity
- Use Promise.all for parallel fetching
- Pass data as props, not fetch in client

### 3. Client Component Pattern

**Location**: `src/app/dashboard/*/module-view.tsx`

```typescript
"use client" // Required for interactivity

/**
 * Component documentation
 * Explains state management and user interactions
 */

interface Props {
  initialData: TypeHere
}

export function ModuleView({ initialData }: Props) {
  // Local state for form/UI
  const [items, setItems] = useState(initialData)
  const [isLoading, setIsLoading] = useState(false)

  // Handler functions with clear names
  const handleCreate = async (data) => {
    setIsLoading(true)
    const result = await createSomething(data)
    if (result.success) {
      // Update local state
      // Show success message
    }
    setIsLoading(false)
  }

  return (/* JSX */)
}
```

**Key Points**:
- Document props interface
- Use descriptive handler names (handleCreate, handleDelete)
- Manage loading states
- Show user feedback (success/error messages)

### 4. Validation Schema Pattern

**Location**: `src/lib/validations.ts`

```typescript
import { z } from "zod"

// Schema documentation
export const CreateSomethingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z.number().positive("Must be positive"),
  date: z.date().optional(),
  // ... more fields
})

// Infer TypeScript type from schema
export type CreateSomethingInput = z.infer<typeof CreateSomethingSchema>
```

**Key Points**:
- Define all validation rules
- Include helpful error messages
- Export inferred types
- Use in both client and server

### 5. Database Query Pattern

```typescript
// Simple query
const items = await db.storageItem.findMany()

// With filters
const items = await db.storageItem.findMany({
  where: { category: "grains" },
  orderBy: { expirationDate: "asc" },
})

// With relations
const animal = await db.animal.findUnique({
  where: { id },
  include: {
    healthRecords: true,
    productionLogs: true,
  },
})

// Create with relations
await db.checklist.create({
  data: {
    name: "Emergency Kit",
    items: {
      create: [
        { title: "Water" },
        { title: "Food" },
      ],
    },
  },
})
```

**Key Points**:
- Use TypeScript for autocomplete
- Include relations when needed
- Use transactions for complex operations
- Handle errors appropriately

---

## Module Deep Dives

### Authentication Module

**Files**:
- `src/actions/auth.ts` - Server logic
- `src/app/setup/page.tsx` - Initial setup
- `src/app/login/page.tsx` - Login form

**How It Works**:

1. **First Time Setup** (`/setup`)
   - User creates PIN (min 4 chars)
   - PIN is hashed with bcrypt (SALT_ROUNDS = 10)
   - Hash stored in Settings table
   - Session cookie created
   - Redirect to dashboard

2. **Subsequent Logins** (`/login`)
   - User enters PIN
   - Compare with bcrypt.compare()
   - Create session cookie if valid
   - Redirect to dashboard

3. **Session Management**
   - HTTP-only cookie (XSS protection)
   - Secure in production (HTTPS only)
   - SameSite: lax (CSRF protection)
   - TTL from settings (default 7 days)

4. **PIN Changes** (Settings page)
   - Requires current PIN verification
   - Updates hash in database
   - Doesn't invalidate current session

**Security Notes**:
- No password recovery by design
- Single Settings record (singleton)
- PIN never stored in plaintext
- Cookie can't be accessed by JavaScript

### Onboarding Module

**Files**:
- `src/actions/onboarding.ts` - Server logic
- `src/components/onboarding-tour.tsx` - Tour UI
- `src/app/dashboard/onboarding-wrapper.tsx` - Integration
- `prisma/seed-starter-data.ts` - Example data

**How It Works**:

1. **First Dashboard Visit**
   - Check `settings.onboardingCompleted`
   - If false, show tour automatically
   - Tour is client component (interactive)

2. **Tour Steps** (5 steps)
   - Each step explains a module
   - Progress bar shows position
   - Back/Next navigation
   - Skip button (X icon)

3. **Final Step - Data Choice**
   - User decides: load examples or start empty
   - If yes: `seedStarterData()` creates ~60 records
   - All tagged with `isStarterData: true`
   - Settings updated: `onboardingCompleted: true`

4. **Starter Data**
   - Realistic examples across all modules
   - Shows feature capabilities
   - Safe to delete later (tagged records only)

5. **Clearing Data**
   - Settings > Data Management
   - Confirmation dialog with preview
   - Deletes only `isStarterData: true` records
   - User data completely safe

**Design Philosophy**:
- Learn by doing (hands-on examples)
- No pressure (can skip tour)
- Reversible (data can be cleared)
- Educational (comprehensive examples)

### Storage Module

**Files**:
- `src/actions/storage.ts` - CRUD operations
- `src/app/dashboard/storage/page.tsx` - Server page
- `src/app/dashboard/storage/storage-view.tsx` - Client UI

**Key Features**:
- Category-based organization
- Expiration date tracking
- Location management
- Calorie tracking (emergency planning)
- Search and filter

**Data Flow Example** (Creating Item):

```
1. User fills form → storage-view.tsx
2. handleCreate() calls → src/actions/storage.ts
3. createStorageItem() validates data → Zod schema
4. Save to database → Prisma
5. revalidatePath("/dashboard/storage") → Clear Next.js cache
6. Return success → Update UI
7. Refresh page data → Show new item
```

**Common Operations**:

```typescript
// Get all items
const items = await getStorageItems()

// Filter by category
const grains = await getStorageItems({ category: "grains" })

// Search items
const rice = await getStorageItems({ search: "rice" })

// Get expiring items
const expiring = await getExpiringItems(30) // Next 30 days
const urgent = await getExpiringItems(7)    // Next week

// Create item
await createStorageItem({
  name: "White Rice",
  category: "grains",
  quantity: 50,
  unit: "lbs",
  expirationDate: new Date("2030-01-01"),
})

// Update item
await updateStorageItem(id, { quantity: 45 })

// Delete item
await deleteStorageItem(id)
```

### Tasks Module

**Files**:
- `src/actions/tasks.ts` - Task operations
- `src/app/dashboard/tasks/page.tsx` - Server page
- `src/app/dashboard/tasks/tasks-view.tsx` - Client UI

**Key Features**:
- Recurring tasks (iCal RRULE format)
- Priority levels (low, medium, high, urgent)
- Category organization
- Completion tracking
- Duration estimates vs. actuals

**Recurrence Rules**:

```typescript
// Daily
"FREQ=DAILY;INTERVAL=1"

// Weekly (every Monday)
"FREQ=WEEKLY;BYDAY=MO"

// Monthly (1st of month)
"FREQ=MONTHLY;INTERVAL=1"

// Yearly (March 15th)
"FREQ=YEARLY;BYMONTH=3;BYMONTHDAY=15"

// Quarterly
"FREQ=MONTHLY;INTERVAL=3"
```

**Task Lifecycle**:

```
Created (isActive: true, nextDue: future)
    ↓
Due (nextDue <= today)
    ↓
Completed (TaskCompletion created)
    ↓
If recurring: nextDue calculated from RRULE
If one-time: isActive set to false
```

---

## Adding New Features

### Step-by-Step: Adding a New Module

Let's walk through adding a hypothetical "Seeds" module:

#### 1. Database Schema

**File**: `prisma/schema.prisma`

```prisma
// Add to schema.prisma
model Seed {
  id            String   @id @default(cuid())
  name          String   // "Tomato Roma"
  variety       String?  // "Roma"
  type          String   // "vegetable", "herb", "flower"
  quantity      Int      // Number of seeds/packets
  year          Int      // Harvest year
  supplier      String?
  notes         String?
  isStarterData Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([type])
  @@index([year])
}
```

Run migrations:
```bash
npm run db:push
npm run db:generate
```

#### 2. Server Actions

**File**: `src/actions/seeds.ts`

```typescript
"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { CreateSeedSchema, UpdateSeedSchema } from "@/lib/validations"
import { z } from "zod"

/**
 * Seeds Module - Server Actions
 *
 * Manages seed inventory and planning:
 * - Track seed packets and quantities
 * - Organize by type and supplier
 * - Plan for upcoming seasons
 * - Link to garden plantings
 */

export interface Seed {
  id: string
  name: string
  variety: string | null
  type: string
  quantity: number
  year: number
  supplier: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Get all seeds with optional filtering
 */
export async function getSeeds(filters?: {
  type?: string
  year?: number
}): Promise<Seed[]> {
  const where: any = {}

  if (filters?.type) where.type = filters.type
  if (filters?.year) where.year = filters.year

  return db.seed.findMany({
    where,
    orderBy: [
      { type: "asc" },
      { name: "asc" },
    ],
  })
}

/**
 * Create a new seed record
 */
export async function createSeed(
  data: z.infer<typeof CreateSeedSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    const validData = CreateSeedSchema.parse(data)

    await db.seed.create({
      data: validData,
    })

    revalidatePath("/dashboard/seeds")
    return { success: true }
  } catch (error) {
    console.error("Failed to create seed:", error)
    return { success: false, error: "Failed to create seed" }
  }
}

// ... updateSeed, deleteSeed, etc.
```

#### 3. Validation Schemas

**File**: `src/lib/validations.ts`

```typescript
// Add to existing validations.ts
export const CreateSeedSchema = z.object({
  name: z.string().min(1, "Name is required"),
  variety: z.string().optional(),
  type: z.enum(["vegetable", "herb", "flower", "other"]),
  quantity: z.number().int().min(0),
  year: z.number().int().min(2000).max(2100),
  supplier: z.string().optional(),
  notes: z.string().optional(),
})

export const UpdateSeedSchema = CreateSeedSchema.partial()
```

#### 4. Server Page

**File**: `src/app/dashboard/seeds/page.tsx`

```typescript
import { getSeeds } from "@/actions/seeds"
import { SeedsView } from "./seeds-view"

/**
 * Seeds Page - Seed Inventory Management
 *
 * Server Component that fetches seed data and passes to client component.
 * Handles initial data loading and SEO.
 */
export default async function SeedsPage() {
  const seeds = await getSeeds()

  return <SeedsView initialSeeds={seeds} />
}
```

#### 5. Client Component

**File**: `src/app/dashboard/seeds/seeds-view.tsx`

```typescript
"use client"

import { useState } from "react"
import { createSeed, updateSeed, deleteSeed } from "@/actions/seeds"
import type { Seed } from "@/actions/seeds"

/**
 * Seeds View - Interactive seed management interface
 *
 * Features:
 * - Create/edit/delete seeds
 * - Filter by type and year
 * - Search functionality
 * - Bulk operations
 */

interface SeedsViewProps {
  initialSeeds: Seed[]
}

export function SeedsView({ initialSeeds }: SeedsViewProps) {
  const [seeds, setSeeds] = useState(initialSeeds)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async (data: any) => {
    setIsCreating(true)
    const result = await createSeed(data)
    if (result.success) {
      // Refresh data or update local state
    }
    setIsCreating(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Seed Inventory</h1>
        <button onClick={() => setIsCreating(true)}>
          Add Seeds
        </button>
      </div>

      {/* Seed list, filters, etc. */}
    </div>
  )
}
```

#### 6. Add to Navigation

**File**: `src/components/ui/sidebar.tsx` (or wherever nav is defined)

```typescript
// Add to navigation items
{
  name: "Seeds",
  href: "/dashboard/seeds",
  icon: Sprout, // From lucide-react
}
```

#### 7. Add Starter Data (Optional)

**File**: `prisma/seed-starter-data.ts`

```typescript
// In seedStarterData function
const seeds = await Promise.all([
  prisma.seed.create({
    data: {
      name: "Tomato Roma",
      variety: "Roma",
      type: "vegetable",
      quantity: 50,
      year: 2026,
      supplier: "Seed Company",
      isStarterData: true,
    },
  }),
  // ... more examples
])

console.log(`✅ Created ${seeds.length} seeds`)
```

#### 8. Testing

```bash
# Test the flow
1. Start dev server: npm run dev
2. Navigate to /dashboard/seeds
3. Create a seed record
4. Edit the seed
5. Delete the seed
6. Test filters and search
7. Check database: npm run db:studio
```

---

## Testing & Debugging

### Debugging Tools

**1. Console Logging**
```typescript
// Server Actions (shows in terminal)
console.log("Debug:", data)

// Client Components (shows in browser console)
console.log("State:", state)
```

**2. Prisma Studio**
```bash
npm run db:studio
# Opens GUI at http://localhost:5555
# Browse, edit, and query database
```

**3. Next.js Dev Errors**
- Detailed error pages in development
- Shows stack traces and component tree
- Hot reload on file save

**4. Browser DevTools**
- React DevTools extension
- Network tab for API calls
- Console for client-side errors
- Application tab for cookies/storage

### Common Issues

**Issue**: "Too many Prisma clients"
**Solution**: We use singleton pattern in `lib/db.ts` to prevent this

**Issue**: Server Action not updating UI
**Solution**: Did you call `revalidatePath()`?

**Issue**: Type errors with Prisma
**Solution**: Run `npm run db:generate` after schema changes

**Issue**: Changes not appearing
**Solution**: Check if page is Server Component (might be cached)

---

## Common Tasks

### Adding a New Field to Existing Model

1. Update `prisma/schema.prisma`
2. Run `npm run db:push`
3. Run `npm run db:generate`
4. Update validation schema in `lib/validations.ts`
5. Update TypeScript interfaces if needed
6. Update UI forms to include field
7. Update display components

### Creating a New Filter Option

```typescript
// In action file
export async function getItems(filters?: {
  category?: string
  status?: string // New filter
}) {
  const where: any = {}

  if (filters?.category) where.category = filters.category
  if (filters?.status) where.status = filters.status // Add filter logic

  return db.item.findMany({ where })
}

// In UI component
const [statusFilter, setStatusFilter] = useState("all")

// In effect
useEffect(() => {
  getItems({ status: statusFilter })
}, [statusFilter])
```

### Adding a New Validation Rule

```typescript
// lib/validations.ts
export const CreateItemSchema = z.object({
  // ... existing fields
  email: z.string().email("Invalid email"), // New field with validation
  quantity: z.number().min(1).max(1000), // Add min/max constraints
})
```

### Creating a Reusable Component

```typescript
// components/my-component.tsx
/**
 * Component documentation
 */
interface MyComponentProps {
  title: string
  onAction: () => void
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div>
      <h2>{title}</h2>
      <button onClick={onAction}>Click</button>
    </div>
  )
}

// Usage in page
import { MyComponent } from "@/components/my-component"

<MyComponent title="Hello" onAction={() => console.log("clicked")} />
```

---

## Best Practices

### Code Style

1. **Use TypeScript** - Always type your functions and components
2. **Validate inputs** - Use Zod for runtime validation
3. **Handle errors** - Never let errors crash the app
4. **Document intent** - Explain "why", not just "what"
5. **Keep it simple** - Don't over-engineer solutions

### Performance

1. **Fetch in parallel** - Use `Promise.all()` when possible
2. **Revalidate smartly** - Only revalidate affected paths
3. **Optimize queries** - Use database indexes appropriately
4. **Lazy load** - Don't load everything upfront

### Security

1. **Validate server-side** - Never trust client input
2. **Hash passwords** - Use bcrypt, never store plaintext
3. **Sanitize output** - Prevent XSS attacks
4. **Use HTTPS** - In production, always
5. **HTTP-only cookies** - For session management

### Documentation

1. **Module-level comments** - At top of each major file
2. **Function documentation** - For public APIs
3. **Inline comments** - For complex logic only
4. **Examples** - Show how to use it
5. **Update docs** - When code changes

---

## Resources

### Internal Documentation

- **USER_MANUAL.md** - End-user documentation
- **ONBOARDING_IMPLEMENTATION.md** - Onboarding feature details
- **DEVELOPER_GUIDE.md** - This file
- **prisma/schema.prisma** - Database schema with comments

### External Resources

- [Next.js Docs](https://nextjs.org/docs) - Framework documentation
- [Prisma Docs](https://www.prisma.io/docs) - ORM and database
- [Radix UI](https://www.radix-ui.com/) - Component primitives
- [Tailwind CSS](https://tailwindcss.com/) - Styling utility classes
- [Zod](https://zod.dev/) - Schema validation

### Getting Help

1. Check inline code comments
2. Review this guide
3. Search for similar patterns in codebase
4. Read relevant external docs
5. Open GitHub issue with details

---

## Contributing

When adding code to HomesteadHub:

1. **Follow existing patterns** - Consistency matters
2. **Document your code** - Help the next developer
3. **Write clear commits** - Explain what and why
4. **Test thoroughly** - Don't break existing features
5. **Update docs** - Keep guides current

---

**Happy Coding! 🌿**

Remember: Code is read more than it's written. Make it readable.
