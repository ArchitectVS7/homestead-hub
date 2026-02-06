# HomesteadHub — Product Requirements Document

> Reverse-engineered from codebase as of 2026-02-05.
> Single-user, self-hosted farm & homestead management system for the engineer-farmer-survivalist.

---

## 1. Product Overview

### 1.1 Vision

HomesteadHub is a **self-hosted, offline-capable** web application that gives a single homesteader complete control over food storage, garden planning, equipment maintenance, livestock management, weather tracking, task scheduling, resource monitoring, and emergency preparedness — with zero cloud dependencies, zero subscriptions, and zero third-party data access.

### 1.2 Design Principles

| Principle | Implication |
|---|---|
| **Self-hosted** | Runs on any hardware (Raspberry Pi, old laptop, home server). No external SaaS. |
| **Offline-first** | Full functionality without internet. IndexedDB (`idb`) for client cache; sync when connected. |
| **No subscriptions** | One-time setup. No recurring fees, no vendor lock-in. |
| **Single-user** | Simple PIN/password gate — not a full auth system. No multi-tenancy. |

### 1.3 Target User

A single homesteader (or household) who is technically capable enough to run `docker compose up` or `npm run dev` on a local machine.

---

## 2. Architecture

### 2.1 Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | `reactStrictMode: true`, `images.unoptimized: true` for self-hosting |
| Language | TypeScript 5.4+ | Strict mode |
| Database | PostgreSQL + Prisma 5.14 | 16 models, cuid IDs |
| Styling | Tailwind CSS 3.4 | Custom earth/soil/forest/harvest/barn palette |
| UI primitives | Radix UI | Dialog, DropdownMenu, Select, Tabs, Checkbox, Progress |
| Icons | Lucide React | |
| Charts | Recharts 2.12 | For trends, consumption, production graphs |
| Validation | Zod 3.23 | Schema validation for forms and server actions |
| Data fetching | @tanstack/react-query 5.32 | Client cache, optimistic updates |
| Offline cache | idb 8.0 (IndexedDB) | Offline-first reads and queued writes |
| Date handling | date-fns 3.6 | |
| CSS utilities | clsx + tailwind-merge | Via `cn()` helper |

### 2.2 Architectural Decisions

| Decision | Rationale |
|---|---|
| **Server Actions over tRPC** | Zero extra dependencies; built into Next.js 14 App Router. README mentions tRPC but `package.json` has no tRPC dep. Server Actions are the correct path forward. |
| **Simple PIN/password gate** | Single-user system; no OAuth, no sessions, no JWT. A lightweight gate to prevent casual access on a LAN. |
| **No static export** | `output: 'export'` is commented out in `next.config.js`. The app needs a Node.js server for Server Actions + Prisma. |

### 2.3 Navigation Structure

**Primary nav** (sidebar, `"Modules"` group):

| Label | Route | Icon | Module |
|---|---|---|---|
| Dashboard | `/dashboard` | LayoutDashboard | Overview |
| Inventory | `/dashboard/storage` | Warehouse | Food Storage |
| Garden | `/dashboard/garden` | Sprout | Garden Planning |
| Equipment | `/dashboard/equipment` | Wrench | Equipment Maintenance |
| Livestock | `/dashboard/livestock` | PawPrint | Livestock Management |
| Tasks | `/dashboard/tasks` | CalendarCheck | Task Scheduling |
| Resources | `/dashboard/resources` | Droplets | Resource Tracking |
| Weather | `/dashboard/weather` | Cloud | Weather Integration |
| Emergency Prep | `/dashboard/preparedness` | ShieldCheck | Emergency Preparedness |

**Secondary nav** (`"System"` group):

| Label | Route | Icon |
|---|---|---|
| Settings | `/dashboard/settings` | Settings |
| Notifications | `/dashboard/notifications` | Bell |

### 2.4 Design System

**Color palette** (Tailwind extended colors, 50-950 scale each):

- `earth` — warm beige-brown (headings, landing page)
- `soil` — neutral warm gray (backgrounds, text, borders — primary dashboard chrome)
- `forest` — muted green (primary action color, active states, success)
- `harvest` — golden amber (storage module accent, warnings)
- `barn` — red (livestock accent, errors, destructive actions)

**Component tokens** (defined in `globals.css`):

- `.btn-primary` — `forest-600` bg, white text
- `.btn-secondary` — `earth-100` bg, `earth-800` text
- `.card` — white bg, `earth-100` border, rounded-xl, shadow-sm
- `.input` — `earth-200` border, `forest-500` focus ring

**Typography**: Inter (variable font via `next/font/google`), `font-sans` default.

**Layout**: Collapsible sidebar (64px collapsed / 256px expanded), mobile overlay with hamburger. `SidebarLayout` wraps all `/dashboard/*` routes.

---

## 3. Data Model

16 Prisma models across 8 modules. All IDs are `cuid()`. All models have `createdAt`; most have `updatedAt`.

### 3.1 Model Map

```
StorageItem
Crop ──< Planting
Equipment ──< MaintenanceRecord
Animal ──< HealthRecord
Animal ──< ProductionLog
Animal ──< Animal (self-ref: parentId → AnimalLineage)
WeatherSnapshot
Task ──< TaskCompletion
ResourceLog
Checklist ──< ChecklistItem
```

### 3.2 Model Details

#### StorageItem
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String | Required |
| category | String | Indexed. Values: grains, legumes, canned, freeze-dried, dehydrated, frozen, fresh, water, other |
| quantity | Float | |
| unit | String | lbs, oz, gallons, cans, bags, etc. |
| location | String? | pantry, basement, shed, etc. |
| purchaseDate | DateTime? | |
| expirationDate | DateTime? | Indexed. Core feature — drives alerts |
| calories | Int? | Per unit |
| notes | String? | |

#### Crop
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String | Required |
| variety | String? | |
| daysToMaturity | Int? | |
| plantingDepth | String? | e.g. "1/4 inch" |
| spacing | String? | e.g. "12 inches" |
| sunRequirement | String? | full, partial, shade |
| waterRequirement | String? | low, medium, high |
| companionPlants | String[] | Postgres array |
| incompatiblePlants | String[] | Postgres array |
| notes | String? | |
| plantings | Planting[] | One-to-many |

#### Planting
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| cropId | String | FK → Crop. Indexed. Cascade delete. |
| location | String | Bed name, row number, etc. |
| plantDate | DateTime | Indexed |
| transplantDate | DateTime? | |
| expectedHarvest | DateTime? | |
| actualHarvest | DateTime? | |
| quantity | Int? | Number of plants |
| yield | Float? | Actual yield amount |
| yieldUnit | String? | lbs, count, etc. |
| success | Boolean? | |
| notes | String? | |

#### Equipment
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String | Required |
| category | String | Indexed. Values: tractor, mower, tiller, chainsaw, generator, pump, vehicle, tool, other |
| make | String? | |
| model | String? | |
| serialNumber | String? | |
| purchaseDate | DateTime? | |
| purchasePrice | Float? | |
| location | String? | |
| status | String | Indexed. Default "operational". Values: operational, needs-service, out-of-service |
| serviceIntervalHours | Int? | |
| serviceIntervalDays | Int? | |
| currentHours | Float? | |
| lastServiceDate | DateTime? | |
| lastServiceHours | Float? | |
| notes | String? | |
| maintenanceRecords | MaintenanceRecord[] | One-to-many |

#### MaintenanceRecord
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| equipmentId | String | FK → Equipment. Indexed. Cascade delete. |
| date | DateTime | Indexed |
| type | String | oil-change, repair, inspection, etc. |
| description | String | Required |
| hoursAtService | Float? | |
| cost | Float? | |
| parts | String[] | Postgres array |
| performedBy | String? | |
| notes | String? | |

#### Animal
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String? | |
| tag | String? | Ear tag, leg band, etc. |
| type | String | Indexed. Values: chicken, duck, goose, turkey, cow, pig, goat, sheep, horse, rabbit, bee, other |
| breed | String? | |
| sex | String? | male, female, unknown |
| birthDate | DateTime? | |
| acquiredDate | DateTime? | |
| status | String | Indexed. Default "active". Values: active, sold, deceased, processed |
| parentId | String? | Self-referential FK for lineage |
| notes | String? | |
| healthRecords | HealthRecord[] | One-to-many |
| productionLogs | ProductionLog[] | One-to-many |
| offspring | Animal[] | Self-relation (AnimalLineage) |

#### HealthRecord
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| animalId | String | FK → Animal. Indexed. Cascade delete. |
| date | DateTime | Indexed |
| type | String | vaccination, medication, vet-visit, observation |
| description | String | Required |
| medication | String? | |
| dosage | String? | |
| cost | Float? | |
| performedBy | String? | |
| nextDue | DateTime? | Drives reminders |
| notes | String? | |

#### ProductionLog
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| animalId | String | FK → Animal. Indexed. Cascade delete. |
| date | DateTime | Indexed |
| type | String | eggs, milk, wool, etc. |
| quantity | Float | |
| unit | String | |
| quality | String? | Grade A, B, etc. |
| notes | String? | |

#### WeatherSnapshot
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| timestamp | DateTime | Indexed |
| temperature | Float | Fahrenheit |
| feelsLike | Float? | |
| humidity | Int? | Percentage |
| windSpeed | Float? | mph |
| windDirection | String? | |
| precipitation | Float? | Inches |
| conditions | String? | clear, cloudy, rain, snow, etc. |
| pressure | Float? | hPa |
| uvIndex | Int? | |
| source | String? | manual, openweather, etc. |
| notes | String? | |

#### Task
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| title | String | Required |
| description | String? | |
| category | String? | Indexed. Values: garden, livestock, equipment, storage, general |
| priority | String | Default "medium". Values: low, medium, high, urgent |
| recurrenceRule | String? | iCal RRULE format (e.g. `FREQ=WEEKLY;INTERVAL=1`) |
| nextDue | DateTime? | Indexed. Computed from RRULE + lastCompleted |
| lastCompleted | DateTime? | |
| estimatedMinutes | Int? | |
| assignedTo | String? | |
| notes | String? | |
| isActive | Boolean | Default true. Indexed. |
| completions | TaskCompletion[] | One-to-many |

#### TaskCompletion
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| taskId | String | FK → Task. Indexed. Cascade delete. |
| completedAt | DateTime | Default now(). Indexed. |
| completedBy | String? | |
| duration | Int? | Actual minutes taken |
| notes | String? | |

#### ResourceLog
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| type | String | Indexed. Values: water, fuel, seeds, feed, other |
| action | String | usage, purchase, adjustment |
| quantity | Float | |
| unit | String | gallons, lbs, bags, etc. |
| date | DateTime | Default now(). Indexed. |
| cost | Float? | |
| vendor | String? | |
| notes | String? | |

#### Checklist
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String | Required |
| description | String? | |
| category | String? | Indexed. Values: evacuation, shelter-in-place, power-outage, etc. |
| isTemplate | Boolean | Default false. Templates are cloned, not used directly. |
| notes | String? | |
| items | ChecklistItem[] | One-to-many |

#### ChecklistItem
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| checklistId | String | FK → Checklist. Indexed. Cascade delete. |
| title | String | Required |
| description | String? | |
| isCompleted | Boolean | Default false |
| completedAt | DateTime? | |
| sortOrder | Int | Default 0. For drag-to-reorder. |
| notes | String? | |

---

## 4. Feature Specifications

Each feature spec is atomic: independently implementable, testable, and deployable.

---

### F-01: PIN/Password Gate

**Module:** System
**Priority:** P0 (blocks all other features)
**Route:** `/login` (landing page "Sign In" link already points here)

#### Requirements

1. Settings page stores a hashed PIN or password (bcrypt or similar).
2. On first launch (no PIN set), redirect to a "Set your PIN" screen.
3. Submitting the correct PIN sets an HTTP-only cookie (`homestead-session`) with a configurable TTL (default: 7 days).
4. All `/dashboard/*` routes are protected by middleware that checks the cookie.
5. Invalid/missing cookie redirects to `/login`.
6. A "Lock" button in the sidebar footer lets the user manually clear the session.
7. No user accounts, no registration, no OAuth. Single PIN for the entire instance.

#### Acceptance Criteria

- [ ] Accessing `/dashboard` without a valid session redirects to `/login`.
- [ ] Entering the correct PIN redirects to `/dashboard`.
- [ ] Wrong PIN shows inline error; no redirect.
- [ ] "Lock" clears the cookie and returns to `/login`.
- [ ] First-time setup flow prompts to create a PIN.

---

### F-02: Dashboard — Live Summary

**Module:** Dashboard
**Priority:** P1
**Route:** `/dashboard`

#### Requirements

1. **Quick stats row** (4 cards): Items Expiring Soon, Tasks Due Today, Active Plantings, Completed This Week. Each links to the relevant module page.
2. **Module grid** (8 cards): One per module with icon, name, description, and a live stat count (e.g. "127 items tracked"). Links to module page.
3. **Alerts panel**: Auto-generated from:
   - StorageItems with `expirationDate` within 30 days.
   - Equipment where `currentHours - lastServiceHours > serviceIntervalHours`.
   - WeatherSnapshots indicating frost (temperature < 32).
   - Tasks where `nextDue` is past.
4. **Recent activity feed**: Last 5-10 cross-module events (task completions, storage additions, production logs, maintenance records), ordered by `createdAt` desc.

#### Acceptance Criteria

- [ ] All 4 quick-stat values are computed from real DB data via server actions.
- [ ] Module stats are live counts (not hardcoded).
- [ ] Alerts panel shows at least storage expiration, equipment service, and overdue tasks.
- [ ] Recent activity pulls from multiple tables, shows relative timestamps.

---

### F-03: Food Storage — CRUD + Expiration Alerts

**Module:** Storage
**Priority:** P1
**Route:** `/dashboard/storage`

#### Requirements

1. **Table/list view** of all `StorageItem` records with columns: Name, Category, Quantity+Unit, Location, Expiration Date, Calories.
2. **Search** by name (client-side filter or server action).
3. **Filter** by category (`StorageCategory` enum) and location.
4. **Sort** by name, category, expiration date, quantity.
5. **Add Item** — dialog/drawer with Zod-validated form. Fields match `StorageItem` schema.
6. **Edit Item** — pre-filled form in dialog/drawer.
7. **Delete Item** — confirmation dialog.
8. **Expiration alert banner** at the top: count of items expiring within 30 days. Clicking navigates to a filtered view showing only those items.
9. **Color-coded expiration**: red (<7 days), amber (7-30 days), green (>30 days or no date).
10. **Calorie summary**: Total estimated calories across all items (quantity * calories).

#### Data Flow

```
Client (react-query) → Server Action → Prisma → PostgreSQL
                     ← invalidateQueries on mutation
```

#### Acceptance Criteria

- [ ] Can add, edit, and delete storage items.
- [ ] Expiration dates are color-coded in the list.
- [ ] Alert banner shows real count from DB.
- [ ] Search filters the list by name.
- [ ] Category and location filters work.
- [ ] Total calorie count is displayed.

---

### F-04: Garden — Crop Library + Planting Tracker

**Module:** Garden
**Priority:** P1
**Route:** `/dashboard/garden`

#### Requirements

1. **Two sub-views** toggled by buttons (already in UI shell):
   - **Calendar view**: Plantings displayed on a month grid by `plantDate` and `expectedHarvest`.
   - **Grid/card view**: One card per active planting showing crop name, variety, location, status.
2. **Crop library** (accessible from a tab or section): list of `Crop` records with companion/incompatible plant info.
3. **New Planting** — dialog with crop selector (dropdown of `Crop` records), location, plantDate, quantity.
4. **Log Harvest** — mark a planting as harvested with actualHarvest date, yield, yieldUnit, success flag.
5. **Crop CRUD** — Add/edit/delete crop definitions (name, variety, days to maturity, spacing, companion/incompatible plants).
6. **Companion planting warnings**: When creating a planting, warn if incompatible plants are already in the same location.

#### Acceptance Criteria

- [ ] Can switch between calendar and grid views.
- [ ] New Planting form uses crop library dropdown.
- [ ] Harvest logging updates actualHarvest, yield, success.
- [ ] Crop library supports full CRUD.
- [ ] Companion planting conflict warning appears when relevant.

---

### F-05: Equipment — Maintenance Scheduling

**Module:** Equipment
**Priority:** P1
**Route:** `/dashboard/equipment`

#### Requirements

1. **Equipment list** with columns: Name, Category, Status (badge), Hours, Last Service, Next Service Due.
2. **Status badges**: green (operational), amber (needs-service), red (out-of-service).
3. **Service-due logic**: Equipment needs service when `currentHours - lastServiceHours >= serviceIntervalHours` OR `daysSince(lastServiceDate) >= serviceIntervalDays`.
4. **Add Equipment** — Zod-validated form matching `Equipment` schema.
5. **Log Maintenance** — creates a `MaintenanceRecord` and updates `lastServiceDate`/`lastServiceHours` on the parent `Equipment`.
6. **Maintenance history** — expandable section or detail page showing all `MaintenanceRecord` entries for a piece of equipment, ordered by date desc.
7. **Service alert banner** — count of equipment needing service, similar to storage expiration banner.

#### Acceptance Criteria

- [ ] Equipment list shows real data with correct status badges.
- [ ] Logging maintenance updates both the record and the parent equipment.
- [ ] Service-due calculation works by both hours and days.
- [ ] Alert banner reflects real service-due count.

---

### F-06: Livestock — Herd/Flock Management

**Module:** Livestock
**Priority:** P1
**Route:** `/dashboard/livestock`

#### Requirements

1. **Animal list** filterable by type (`LivestockType` enum) and status (active, sold, deceased, processed).
2. **Add Animal** — form matching `Animal` schema. Optional parent selector for lineage.
3. **Animal detail page** (`/dashboard/livestock/[id]`) showing:
   - Basic info (name/tag, type, breed, sex, birth date, status).
   - **Health records** tab — list of `HealthRecord` entries + "Add Health Record" form.
   - **Production logs** tab — list of `ProductionLog` entries + "Log Production" form.
   - **Lineage** — parent link and offspring list.
4. **Production summary**: Per-type aggregation (e.g., total eggs this week, total milk this month). Suitable for Recharts line/bar chart.
5. **Health reminders**: HealthRecords with `nextDue` in the past or within 7 days should surface as alerts.

#### Acceptance Criteria

- [ ] Animal list filters by type and status.
- [ ] Animal detail page shows health records, production logs, and lineage.
- [ ] Can add health records and production logs from the detail page.
- [ ] Production summary chart renders with real data.
- [ ] Health reminders surface for upcoming/overdue records.

---

### F-07: Task Scheduling — Recurring Tasks + Completions

**Module:** Tasks
**Priority:** P1
**Route:** `/dashboard/tasks`

#### Requirements

1. **Task list** with sections: Overdue, Due Today, Upcoming This Week, All Active.
2. **Stat cards** (already in UI shell): Due Today, Overdue, Completed This Week, Upcoming This Week — computed from DB.
3. **Add Task** — form with title, description, category, priority, recurrence rule (UI for common patterns: daily, weekly, monthly, quarterly, annual + custom RRULE), estimatedMinutes.
4. **Complete Task** — creates a `TaskCompletion` record (with optional duration and notes), then recalculates `nextDue` from the RRULE. Updates `lastCompleted`.
5. **Task detail/edit** — inline or dialog edit of task properties.
6. **Deactivate Task** — sets `isActive` to false (soft delete). Does not delete completions.
7. **Completion history** — expandable list of `TaskCompletion` entries for a task.

#### Acceptance Criteria

- [ ] Stat cards reflect real data.
- [ ] Completing a task creates a completion record and advances `nextDue`.
- [ ] Recurrence options cover daily, weekly, monthly, quarterly, annual.
- [ ] Overdue tasks are visually distinct (red/amber styling).
- [ ] Deactivated tasks disappear from the active list.

---

### F-08: Resource Tracking — Consumables Ledger

**Module:** Resources
**Priority:** P2
**Route:** `/dashboard/resources`

#### Requirements

1. **Resource summary cards** (already in UI shell): One per resource type showing current computed balance (sum of purchases minus sum of usage), unit, and trend.
2. **Log Usage/Purchase** — form with type (from `ResourceType` enum + free text), action (usage/purchase/adjustment), quantity, unit, cost, vendor, date.
3. **Resource history** — filterable table of `ResourceLog` entries by type and date range.
4. **Consumption trend chart** (Recharts): line chart of net balance over time per resource type. Weekly or monthly granularity toggle.
5. **Low-stock alerts**: Configurable thresholds per resource type. Alert when computed balance drops below threshold.

#### Acceptance Criteria

- [ ] Summary cards show computed balances from actual logs.
- [ ] Can log usage, purchases, and adjustments.
- [ ] History table filters by type and date range.
- [ ] Trend chart renders with real data.
- [ ] Low-stock alerts trigger at configured thresholds.

---

### F-09: Weather — Manual + API Snapshots

**Module:** Weather
**Priority:** P2
**Route:** `/dashboard/weather`

#### Requirements

1. **Current conditions card** (already in UI shell): temperature, feels-like, humidity, wind speed/direction. Data source: latest `WeatherSnapshot`.
2. **Manual weather log** — form to create a `WeatherSnapshot` with all fields.
3. **Optional API integration** — if an OpenWeatherMap API key is configured in Settings, auto-fetch current conditions and create a snapshot on a configurable interval.
4. **Frost alert banner**: Displayed when latest or upcoming snapshot has `temperature <= 32`.
5. **Historical data table** — paginated list of snapshots, filterable by date range.
6. **Temperature trend chart** (Recharts): line chart of temperature over time with precipitation overlay.

#### Acceptance Criteria

- [ ] Current conditions card shows latest snapshot data.
- [ ] Manual weather logging creates a valid snapshot.
- [ ] Frost alert appears when temperature <= 32.
- [ ] Historical table is paginated and filterable.
- [ ] Trend chart renders with real data.

---

### F-10: Emergency Preparedness — Checklists + Readiness Score

**Module:** Preparedness
**Priority:** P2
**Route:** `/dashboard/preparedness`

#### Requirements

1. **Readiness score** (already in UI shell): Percentage calculated as `completedItems / totalItems` across all non-template checklists.
2. **Checklist list**: Shows all checklists with name, category, completion progress bar.
3. **New Checklist** — create blank or clone from a template (`isTemplate: true`).
4. **Checklist detail**: Ordered list of `ChecklistItem` entries. Toggle completion (updates `isCompleted` + `completedAt`). Drag-to-reorder (updates `sortOrder`).
5. **Add/edit/delete checklist items** inline.
6. **Template management**: Mark checklists as templates. Templates cannot be directly checked off — they must be cloned first.
7. **Category filter**: Filter checklists by category (evacuation, shelter-in-place, power-outage, etc.).

#### Acceptance Criteria

- [ ] Readiness score is computed from real completion data.
- [ ] Cloning a template creates a new checklist with all items (all unchecked).
- [ ] Items can be toggled, reordered, added, edited, and deleted.
- [ ] Templates cannot be directly completed.
- [ ] Category filter works.

---

### F-11: Settings — Instance Configuration

**Module:** System
**Priority:** P1
**Route:** `/dashboard/settings`

#### Requirements

1. **Location settings**: USDA hardiness zone, ZIP code, coordinates (lat/long for weather API).
2. **Unit preference**: Imperial or Metric. Stored in DB or config. Affects display of temperature, weight, volume across all modules.
3. **Notification preferences**: Toggle switches for expiration warnings, equipment service reminders, frost alerts, task reminders. Configurable thresholds (e.g., expiration warning = 30 days).
4. **Weather API key**: Optional OpenWeatherMap API key input.
5. **PIN management**: Change PIN (requires current PIN).
6. **Data management**: Export all data as JSON. Import from JSON backup.
7. All settings persisted via server action. Single settings record or key-value store.

#### Acceptance Criteria

- [ ] All settings fields persist and reload on page refresh.
- [ ] Unit preference changes are reflected across the app.
- [ ] PIN can be changed.
- [ ] Export produces a valid JSON file with all data.
- [ ] Import restores data from a JSON backup.

---

### F-12: Notifications — In-App Alert Feed

**Module:** System
**Priority:** P2
**Route:** `/dashboard/notifications`

#### Requirements

1. **Notification list**: Ordered by timestamp desc. Types: warning, alert, info, success.
2. **Auto-generated notifications** from:
   - Storage: items expiring within configured threshold.
   - Equipment: service overdue.
   - Tasks: overdue tasks.
   - Weather: frost alerts.
   - Health records: upcoming vaccinations/vet visits (`nextDue`).
3. **Read/unread state**: Unread notifications have a visual indicator (dot). "Mark all as read" button.
4. **Delete** individual notifications.
5. **Notification badge** on the sidebar Bell icon showing unread count.

#### Acceptance Criteria

- [ ] Notifications are auto-generated from cross-module triggers.
- [ ] Read/unread toggle works.
- [ ] "Mark all as read" clears all unread indicators.
- [ ] Individual delete works.
- [ ] Sidebar badge shows unread count.

---

### F-13: Offline-First with IndexedDB

**Module:** Cross-cutting
**Priority:** P2

#### Requirements

1. **Read cache**: On page load, serve data from IndexedDB (`idb` library) while fetching fresh data from the server. Show stale data immediately; replace when server responds.
2. **Write queue**: When offline, queue mutations (create/update/delete) in IndexedDB. Sync to server when connectivity resumes.
3. **Conflict resolution**: Last-write-wins based on `updatedAt` timestamp. No merge.
4. **Sync indicator**: UI element (e.g., in sidebar or top bar) showing online/offline status and pending sync count.

#### Acceptance Criteria

- [ ] Pages render cached data when server is unreachable.
- [ ] Mutations made offline are synced when connection restores.
- [ ] Sync indicator shows pending count and online/offline status.

---

## 5. Server Action Patterns

All data mutations and queries should follow this pattern:

```typescript
// src/actions/storage.ts
"use server";

import { db } from "@/lib/db";
import { z } from "zod";

const CreateStorageItemSchema = z.object({
  name: z.string().min(1),
  category: z.string(),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  location: z.string().optional(),
  purchaseDate: z.date().optional(),
  expirationDate: z.date().optional(),
  calories: z.number().int().optional(),
  notes: z.string().optional(),
});

export async function createStorageItem(input: z.infer<typeof CreateStorageItemSchema>) {
  const data = CreateStorageItemSchema.parse(input);
  return db.storageItem.create({ data });
}
```

**Client-side pattern**: `@tanstack/react-query` with `useMutation` calling server actions, `invalidateQueries` on success.

---

## 6. Shared Type Enums

Already defined in `src/types/index.ts`:

| Type | Values |
|---|---|
| `RecurrenceInterval` | daily, weekly, monthly, quarterly, annual |
| `TaskPriority` | low, medium, high, urgent |
| `ResourceType` | water, fuel, seeds, feed, other |
| `LivestockType` | chicken, duck, goose, turkey, cow, pig, goat, sheep, horse, rabbit, bee, other |
| `EquipmentCategory` | tractor, mower, tiller, chainsaw, generator, pump, vehicle, tool, other |
| `StorageCategory` | grains, legumes, canned, freeze-dried, dehydrated, frozen, fresh, water, other |

Plus `DateRange` and `Coordinates` interfaces.

---

## 7. Existing Utilities

| File | Exports | Notes |
|---|---|---|
| `src/lib/db.ts` | `db` (PrismaClient) | Singleton with dev logging |
| `src/lib/utils.ts` | `cn()` | clsx + tailwind-merge |
| | `formatDate()` | Intl.DateTimeFormat, "Jan 1, 2026" |
| | `daysUntil()` | Days from now to target date |
| | `pluralize()` | Simple singular/plural |

---

## 8. Seed Data Patterns

The seed script (`prisma/seed.ts`) establishes these patterns:

- **Crops**: 3 records (Tomato Roma, Lettuce Butterhead, Zucchini Black Beauty) with full companion/incompatible arrays.
- **Emergency checklist**: 1 template ("72-Hour Emergency Kit") with 20 items using `sortOrder`.
- **Tasks**: 4 recurring tasks using iCal RRULE strings (`FREQ=MONTHLY`, `FREQ=YEARLY;BYMONTH=3`, `FREQ=WEEKLY`).
- **Storage items**: 3 items (White Rice, Pinto Beans, Canned Tomatoes) with categories, locations, expiration dates, and calorie counts.

---

## 9. Implementation Priority

| Phase | Features | Rationale |
|---|---|---|
| **Phase 0** | F-01 (PIN Gate) | Blocks all protected routes |
| **Phase 1** | F-02 (Dashboard), F-03 (Storage), F-07 (Tasks), F-11 (Settings) | Core loop: manage supplies and tasks daily |
| **Phase 2** | F-04 (Garden), F-05 (Equipment), F-06 (Livestock) | Full module coverage |
| **Phase 3** | F-08 (Resources), F-09 (Weather), F-10 (Preparedness) | Supporting modules |
| **Phase 4** | F-12 (Notifications), F-13 (Offline-First) | Polish and resilience |

---

## 10. Open Questions

1. **Notification persistence model**: Should notifications be a separate Prisma model, or computed on-the-fly from existing data? A dedicated model allows read/unread state and deletion; computed is simpler.
2. **Weather API polling**: Should auto-fetch run via a cron job, Next.js `revalidate`, or a client-side interval?
3. **Data export format**: Plain JSON dump of all tables, or a structured format with version metadata for forward compatibility?
4. **Resource thresholds**: Where to store per-resource-type low-stock thresholds? Settings table, or a dedicated `ResourceThreshold` model?
5. **Offline scope**: Which modules get full offline support first, or all at once?
