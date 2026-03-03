# homestead-hub — Architecture

> **Status:** Active
> **Version:** 1.0
> **Last Updated:** 2026-03-03
> **Author:** VS7
> **PRD:** [docs/PRD.md](./PRD.md)

---

## System Overview

HomesteadHub is a **self-hosted Next.js 16 monolith** designed to run on a Raspberry Pi or equivalent single-board computer within a home network. It targets a single household — no multi-tenancy, no cloud account, no subscriptions. Prisma + SQLite provide zero-infrastructure persistence; the entire data store is a single file on disk. Server Actions are the only API layer — there is no separate REST or RPC surface. An IndexedDB-backed offline layer enables full read access and mutation queuing when the host machine is unreachable from another device on the LAN. The system is intentionally scoped to never require internet access after Docker deployment.

### Top-Level Diagram

```
[Browser — any LAN device]
        │  HTTP (local network)
        ▼
[Next.js 16 App Router — Docker on Raspberry Pi / home server]
        │
        ├─── Server Components (read path: Prisma → SQLite)
        │
        ├─── Server Actions (write path: Zod → Prisma → revalidatePath)
        │
        └─── src/middleware.ts (session cookie gate on /dashboard/*)
                │
                ▼
        [Prisma ORM]
                │
                ▼
        [SQLite — /app/data/homestead.db]
                │ (Docker volume, survives restarts)

Offline Layer (browser-side):
[IndexedDB — two stores]
  keyval        → read cache (mirrored server data)
  mutationQueue → write queue (replayed on reconnect)
```

---

## Component Architecture

### 1. Next.js App Router (Renderer + Action Host)

- **Responsibility:** Serves all pages as Server Components by default; hosts all Server Actions; enforces route-level authentication via middleware.
- **Technology:** Next.js 16.1.6, React 19, TypeScript 5.4 (strict)
- **Inputs:** HTTP requests from LAN browser; session cookie for auth state
- **Outputs:** Server-rendered HTML; Server Action responses (`{ success, error }`)
- **Notes:** `output: 'export'` is explicitly disabled — the app requires Node.js for Server Actions and Prisma. Images use `unoptimized: true` for self-hosted use.

### 2. Server Actions Layer (Business Logic)

- **Responsibility:** Implements all CRUD for each module; validates input via Zod before touching the database; calls `revalidatePath()` to clear the Next.js cache after mutations.
- **Technology:** Next.js Server Actions (`"use server"`), Zod 3.23
- **Inputs:** Form data or direct function calls from client components
- **Outputs:** `{ success: boolean; error?: string }` — consumed by client for toast feedback
- **Notes:** One file per module in `src/actions/`. No REST surface. Validation is applied at this boundary; downstream Prisma calls trust the schema.

| Module | Action File | Key Operations |
|--------|------------|----------------|
| Auth | `auth.ts` | setupPIN, verifyPIN, lockSession, changePIN |
| Storage | `storage.ts` | CRUD for StorageItem; getExpiringItems |
| Garden | `garden.ts` | CRUD for Crop, Planting |
| Equipment | `equipment.ts` | CRUD for Equipment, MaintenanceRecord |
| Livestock | `livestock.ts` | CRUD for Animal, HealthRecord, ProductionLog |
| Tasks | `tasks.ts` | CRUD for Task, TaskCompletion; RRULE recurrence |
| Resources | `resources.ts` | CRUD for ResourceLog |
| Weather | `weather.ts` | WeatherSnapshot; frost alert generation |
| Preparedness | `preparedness.ts` | Checklist + ChecklistItem; template cloning |
| Notifications | `notifications.ts` | Cross-module alert generation |
| Settings | `settings.ts` | PIN change, location, API keys, export/import |
| Onboarding | `onboarding.ts` | seedStarterData, tour completion |

### 3. Prisma ORM + SQLite

- **Responsibility:** Provides type-safe database access across 16 models; manages schema migrations; runs as a singleton client to avoid connection exhaustion in development.
- **Technology:** Prisma 5.14, SQLite (default); `DATABASE_URL` env var supports PostgreSQL drop-in replacement
- **Inputs:** Typed query parameters from Server Actions
- **Outputs:** Typed domain objects (CUID IDs, timestamps included)
- **Notes:** Singleton client in `src/lib/db.ts` prevents "too many clients" during Next.js hot reload. All IDs are CUIDs. Indexes on frequently filtered fields (expirationDate, status, isActive, date).

### 4. IndexedDB Offline Cache

- **Responsibility:** Mirrors server data locally for offline reads; queues write mutations when the network is unavailable; replays the queue on reconnect using last-write-wins conflict resolution.
- **Technology:** `idb` 8.0.3 (IndexedDB wrapper), `src/lib/offline.ts`, `src/lib/action-registry.ts`
- **Inputs:** Online/offline events from `useNetworkStatus`; form mutations during offline periods
- **Outputs:** Cached data displayed in UI during offline; replayed mutations to Server Actions on reconnect
- **Notes:** Two IndexedDB stores: `keyval` (read cache) and `mutationQueue` (write queue). `action-registry.ts` maps action names to functions for mutation replay. Conflict resolution is timestamp-based (updatedAt).

### 5. PIN Authentication System

- **Responsibility:** Provides lightweight single-user access control via a hashed PIN stored in the Settings singleton; manages HTTP-only session cookies.
- **Technology:** bcrypt 6.0 (10 salt rounds), Next.js middleware, HTTP-only cookies
- **Inputs:** 4–6 digit PIN from login form
- **Outputs:** Session cookie (`homestead-session`); redirect to `/login` when absent
- **Notes:** No user accounts, no OAuth. One PIN per installation. `src/middleware.ts` checks the cookie on all `/dashboard/*` routes. Session TTL is configurable in Settings (default 7 days).

### 6. UI Layer (Radix UI + Tailwind)

- **Responsibility:** Delivers accessible, responsive UI components with a consistent homestead design system.
- **Technology:** Radix UI (Dialog, Select, Tabs, Checkbox, Progress), Tailwind CSS 3.4, Lucide React, Recharts 2.12
- **Inputs:** Props and state from page and feature components
- **Outputs:** Rendered HTML/CSS; chart visualizations for trends and production data
- **Notes:** Five-color Tailwind palette: earth (headings), soil (backgrounds), forest (primary actions), harvest (storage accent), barn (errors/livestock). `cn()` helper (`clsx` + `tailwind-merge`) for conditional class merging.

---

## Data Architecture

### Entity Model

| Entity | Key Fields | Relationships |
|--------|------------|---------------|
| `StorageItem` | name, category, quantity, unit, location, expirationDate, calories | — |
| `Crop` | name, variety, daysToMaturity, companionPlants (JSON), incompatiblePlants (JSON) | has many Planting |
| `Planting` | cropId, location, plantDate, expectedHarvest, actualHarvest, yield | belongs to Crop |
| `Equipment` | name, category, status, serviceIntervalDays, lastServiceDate, currentHours | has many MaintenanceRecord |
| `MaintenanceRecord` | equipmentId, date, type, cost, parts (JSON) | belongs to Equipment |
| `Animal` | name, tag, type, breed, sex, birthDate, status, parentId (self-ref) | has many HealthRecord, ProductionLog |
| `HealthRecord` | animalId, date, type, medication, cost, nextDue | belongs to Animal |
| `ProductionLog` | animalId, date, type, quantity, unit, quality | belongs to Animal |
| `Task` | title, priority, recurrenceRule (iCal RRULE), nextDue, isActive | has many TaskCompletion |
| `TaskCompletion` | taskId, completedAt, duration, notes | belongs to Task |
| `ResourceLog` | type, action, quantity, unit, date, cost, vendor | — |
| `WeatherSnapshot` | timestamp, temperature, humidity, precipitation, source | — |
| `Checklist` | name, category, isTemplate | has many ChecklistItem |
| `ChecklistItem` | checklistId, title, isCompleted, sortOrder | belongs to Checklist |
| `Settings` | hashedPIN, sessionTTLDays, hardinessZone, latitude, longitude, unitPreference, onboardingCompleted | Singleton (1 row) |
| `Notification` | type, title, source, sourceId, isRead | — |

### Persistence Strategy

| Data Type | Storage | Reason |
|-----------|---------|--------|
| All domain data (16 models) | SQLite via Prisma | Single-file, zero-infrastructure; portable; survives reboots via Docker volume |
| Session state | HTTP-only cookie (`homestead-session`) | Stateless server; no sessions table needed |
| Offline read cache | IndexedDB (`keyval` store) | Browser-native; survives page refresh; no server required |
| Pending mutations (offline) | IndexedDB (`mutationQueue` store) | Ordered queue; replayed on reconnect |
| Starter/seed data | Prisma seed scripts (`prisma/seed-starter-data.ts`) | Tagged `isStarterData: true` for easy cleanup |

### Data Flow

**Write path (online):**

1. User submits form → Client Component calls Server Action
2. Server Action validates input via Zod schema → rejects on error, returns `{ success: false, error }`
3. Prisma writes to SQLite → `revalidatePath()` clears Next.js page cache
4. Server re-renders page with fresh data → Client shows success toast

**Write path (offline):**

1. User submits form → `useNetworkStatus` detects offline state
2. Mutation stored in IndexedDB `mutationQueue` with action name + args
3. `SyncIndicator` shows pending count to user
4. On reconnect → `syncQueue()` reads queue → replays each mutation via `action-registry.ts`
5. Last-write-wins conflict resolution (updatedAt timestamp)

---

## API Architecture

### Style & Conventions

- **API style:** Next.js Server Actions only — no REST, no RPC
- **Entry point:** `src/actions/{module}.ts` files called directly from components
- **Auth:** Session cookie checked by `src/middleware.ts` before any dashboard route renders
- **Validation:** Zod schemas in `src/lib/validations.ts` — all 16 models have Create/Update schemas
- **Error format:** `{ success: boolean; error?: string }` — no exception propagation to client
- **No external API consumers:** All callers are internal React components

### External API Dependencies

| Service | Used For | Failure Mode |
|---------|----------|--------------|
| OpenWeatherMap (optional) | Weather snapshots via API key in Settings | Falls back to manual snapshot entry — no outage |
| None (all others) | — | System is fully self-contained without any external service |

---

## Deployment Architecture

### Environments

| Environment | Host | URL / Access | Purpose |
|-------------|------|--------------|---------|
| Development | Local machine | `http://localhost:3000` | Dev with `.env.local` |
| Production | Docker on Raspberry Pi or home server | `http://<LAN_IP>:3000` | Live household use |

*No staging environment — single-user household app. Testing is done locally before Docker rebuild.*

### CI/CD Pipeline

1. Developer makes changes locally → runs `npm run lint` + `npm run typecheck`
2. `docker compose build` → rebuilds the image
3. `docker compose up -d` → replaces running container; SQLite volume persists data
4. No automated CI/CD pipeline — manual local → Docker workflow

*Pre-commit checks via lint-staged are configured for future use.*

### Infrastructure Notes

- **Hosting:** Docker Compose on any Node 18+-capable machine. Volume `./data:/app/data` persists the SQLite file across container restarts.
- **Database migrations:** `prisma migrate dev` (development); `prisma migrate deploy` (production) — run inside the container or via `docker exec`.
- **Secrets:** `DATABASE_URL` only required env var; optionally `WEATHER_API_KEY` for live weather. No secrets management service needed.
- **Rollback:** Stop container, restore `homestead.db` from backup, restart. No git-based rollback — the database is the source of truth.
- **Backup:** `npm run db:export` (settings action) provides JSON export. Manual file copy of `homestead.db` is sufficient for full backup.

---

## Security Architecture

### Authentication

- **Implementation:** bcrypt-hashed PIN stored in `Settings.hashedPIN` (10 salt rounds); compared on each login via `bcrypt.compare()`
- **Token/session format:** Opaque session value in HTTP-only cookie (`homestead-session`); no JWT
- **Expiry / refresh:** Configurable TTL in Settings (default 7 days); no automatic refresh — user must re-login after expiry

### Authorisation

- **Enforcement layer:** `src/middleware.ts` — all `/dashboard/*` routes require a valid session cookie; no sub-route granularity needed (single user, no roles)
- **Roles / permission model:** None — single-user system. Either you have the PIN or you don't.

### Data Protection

- **PII stored:** None explicitly. User-entered homestead data (crop names, animal health records, task notes) is stored locally and never leaves the device.
- **Encryption at rest:** SQLite file is unencrypted on disk. Physical security of the host machine is the relevant control.
- **Encryption in transit:** HTTP within the LAN (no TLS by default). Users who expose the port externally should front it with a reverse proxy (nginx + Let's Encrypt).

### Mitigations

| Attack Surface | Mitigation |
|---------------|------------|
| Brute-force PIN | bcrypt adds ~100ms per attempt; no lockout mechanism yet (single-user LAN device, low risk) |
| XSS | React's JSX escaping; no `dangerouslySetInnerHTML` |
| CSRF | Server Actions use POST with origin check built into Next.js; `SameSite=Lax` cookie |
| SQL injection | Prisma parameterises all queries; no raw SQL in application code |
| Session hijacking | HTTP-only cookie (not accessible to JS); Secure flag in HTTPS-fronted deployments |

---

## Performance Architecture

### Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Page load (LAN, RPi 4) | < 2s | Server-rendered; no client JS for initial paint |
| Server Action round-trip | < 500ms | Prisma + SQLite; no network hops |
| Offline read access | Immediate | IndexedDB cache; no server needed |

### Caching Strategy

| Data | Cache Layer | TTL | Invalidation |
|------|------------|-----|--------------|
| Page data | Next.js page cache | Until `revalidatePath()` called | On every successful Server Action write |
| Offline data | IndexedDB `keyval` | Session | Overwritten on next online fetch |
| Static assets | Next.js built output | Immutable | New Docker build |

### Known Bottlenecks

| Bottleneck | Mitigation | Status |
|-----------|------------|--------|
| SQLite write contention (single writer) | Single-user design — no concurrent writers | Accepted by design |
| Raspberry Pi CPU (ARM) | Server Components reduce client JS; SQLite is fast for single-user scale | Accepted |
| Recharts renders on large datasets | Database indexes on date fields keep queries fast; Recharts handles <10K points well | Accepted |

---

## Decision Log

| # | Decision | Alternatives Considered | Rationale | Consequence |
|---|----------|------------------------|-----------|-------------|
| 1 | Server Actions over tRPC | tRPC, REST API routes | Server Actions colocate business logic with the page; no client-generated API client needed for a single-consumer app | No external API surface — third-party integrations would require exposing REST routes separately |
| 2 | SQLite over PostgreSQL | PostgreSQL, PocketBase | Single file, zero infrastructure, works offline, trivially portable — ideal for Raspberry Pi; `DATABASE_URL` override means PostgreSQL is available if needed | Concurrent write limitation; not suitable if multiple users or processes write simultaneously |
| 3 | PIN auth over OAuth | Clerk, NextAuth, Supabase Auth | No external service dependency; works fully offline; appropriate for household-private tool | No email recovery if PIN is forgotten; no multi-user accounts |
| 4 | IndexedDB for offline over service worker cache | Service Worker Cache API, no offline support | Mutation queueing with replay requires structured storage, not just HTTP cache | Added complexity in `offline.ts` and `action-registry.ts`; last-write-wins conflict model is a simplification |
| 5 | Docker for deployment over bare Node | systemd service, PM2, bare metal | Docker encapsulates Node version, dependencies, and SQLite volume in one unit; portable across Raspberry Pi OS, Ubuntu, etc. | Docker overhead on RPi 3 is noticeable; RPi 4 is the practical minimum |
| 6 | iCal RRULE for task recurrence | Custom recurrence model, cron strings | RRULE is a standard format for recurring events (used by calendar apps); enables future calendar export | RRULE parsing is non-trivial; requires a library and careful handling of timezone-free local dates |

---

## Open Questions

| Question | Owner | Due | Status |
|----------|-------|-----|--------|
| Should data export be JSON, CSV, or both? | VS7 | v0.2 | Open |
| Should there be a PIN lockout after N failed attempts? | VS7 | v0.2 | Open |
| Is there a path to multi-user (family members with separate PINs)? | VS7 | Backlog | Open |
| Should automatic weather polling be supported (vs manual snapshots)? | VS7 | Backlog | Open |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-03 | VS7 | Initial draft — derived from DEVELOPER_GUIDE.md, ASSESSMENT_DETAILED.md, and codebase survey |
