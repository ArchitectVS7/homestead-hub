# HomesteadHub — Full Project Assessment

> Generated: February 2026 | Assessed by: Claude (Sonnet 4.5)
> Concise version: [`ASSESSMENT.md`](../ASSESSMENT.md) (root)

---

## 1. Development Status

**Verdict: MVP — feature-complete, not yet Alpha-ready**

All four phases defined in the PRD are implemented:

| Phase | Scope | Status |
|---|---|---|
| 0 | Auth (PIN), Settings, Onboarding tour | Complete |
| 1 | Food Storage, Task Scheduling, Dashboard | Complete |
| 2 | Garden Planning, Equipment Maintenance, Livestock | Complete |
| 3 | Resources, Weather, Emergency Preparedness | Complete |
| 4 | Notifications, Offline Sync (IndexedDB) | Complete |

**What prevents an Alpha release:**

- The README contained critical inaccuracies that made first-time setup impossible (fixed in the accompanying PR — see §4)
- No CI/CD pipeline — tests exist but are never automatically enforced
- Test coverage is partial — garden, equipment, and livestock modules have no tests
- Schema managed via `db:push` (non-tracked, destructive on schema changes) rather than `prisma migrate`
- No Docker or deployment documentation existed for the stated self-hosted use case (added in the accompanying PR)
- No data export/import — a significant gap for the self-reliance target audience
- Version `0.1.0`, no public release history

**Total codebase:** ~8,500 lines of TypeScript across 70+ source files.

---

## 2. Tech Stack

### Framework & Language

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Framework | Next.js App Router | 16.1.6 | Server Components + Server Actions pattern used correctly |
| Language | TypeScript | 5.4 | `strict: true` enforced throughout |
| Runtime | Node.js | 18+ | Required |

### Data Layer

| Layer | Choice | Version | Notes |
|---|---|---|---|
| ORM | Prisma | 5.14 | Industry standard; type-safe queries |
| Database | SQLite | — | Correct choice for self-hosted, single-household |
| Client cache | IndexedDB via `idb` | 8.0.3 | Offline-first implementation |

SQLite is the right database for this use case. The Prisma schema is also configured to support PostgreSQL via environment variable swap, which gives a clear upgrade path if multi-user or hosted deployment is ever needed.

### UI & Styling

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Components | Radix UI | Various | Accessible, unstyled primitives — industry standard |
| Styling | Tailwind CSS | 3.4.19 | Utility-first with a custom 5-color theme (earth, soil, forest, harvest, barn) |
| Icons | Lucide React | 0.378 | Current |
| Charts | Recharts | 2.12 | Appropriate for the data volume in this app |

### State & Validation

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Server state | TanStack React Query | 5.32 | Current major version |
| Validation | Zod | 3.23 | All models have corresponding Zod schemas in `lib/validations.ts` |
| Auth | bcrypt + HTTP-only cookie | bcrypt 6.0 | Appropriate for single-user local app; would need rethinking for multi-user |
| Date handling | date-fns | 3.6 | Current |
| Recurrence | iCal RRULE strings | — | Smart choice — standards-compliant, avoids reinventing scheduling |

### Testing

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Framework | Vitest | 4.0.18 | Current |
| Mocking | vitest-mock-extended | 3.1 | Current |

**Dependency health:** `npm audit` returns **0 vulnerabilities** across all severity levels (critical: 0, high: 0, moderate: 0, low: 0).

### Architecture Patterns

**Server Components / Server Actions:** The app follows the recommended Next.js App Router pattern correctly — pages are Server Components that fetch data on the server with zero client JavaScript for the initial data fetch. Mutations are handled via Server Actions (`"use server"`) with Zod validation, try/catch error handling, `revalidatePath()` for cache invalidation, and a consistent `{ success: boolean; error?: string }` return shape.

**Offline-first:** `src/lib/offline.ts` implements a two-store IndexedDB architecture:
- Store 1 (`keyval`): Read cache — all server data mirrored locally
- Store 2 (`mutationQueue`): Write queue — mutations stored offline and replayed on reconnect

Conflict resolution is last-write-wins by timestamp, which is appropriate for a single-household app.

**Auth flow:**
1. First launch → `/setup` → user creates PIN
2. PIN bcrypt-hashed (10 salt rounds) → stored in `Settings` singleton record
3. Login → `/login` → PIN verified → HTTP-only session cookie set (`homestead-session`, configurable TTL, default 7 days)
4. `src/middleware.ts` protects all `/dashboard/*` routes, redirects to `/login` if cookie absent

No plaintext PIN storage. Cookies are `httpOnly: true`, `secure: true` (production), `sameSite: lax`.

---

## 3. Database Schema

16 Prisma models using CUID IDs:

| Model(s) | Purpose | Notable Design |
|---|---|---|
| `Settings` | App-wide singleton (PIN, prefs, location) | Single record, never deleted |
| `StorageItem` | Food inventory | Indexed on `category`, `expirationDate` |
| `Crop` + `Planting` | Garden management | `companionPlants`/`incompatiblePlants` as JSON arrays |
| `Equipment` + `MaintenanceRecord` | Equipment tracking | Dual service trigger: hours OR days since last service |
| `Animal` + `HealthRecord` + `ProductionLog` | Livestock | Self-referential `parentId` for breeding lineage |
| `Task` + `TaskCompletion` | Recurring tasks | `recurrenceRule` stores iCal RRULE strings |
| `ResourceLog` | Consumables | Types: water, fuel, seeds, feed, other |
| `WeatherSnapshot` | Weather records | Source field supports manual or API-sourced entries |
| `Checklist` + `ChecklistItem` | Emergency prep | `isTemplate` flag enables reusable templates |
| `Notification` | Cross-module alerts | `source` + `sourceId` links back to originating record |

---

## 4. Documentation Audit

### What Exists (internal docs — excellent)

| Document | Size | Quality | Notes |
|---|---|---|---|
| `docs/PRD.md` | 31 KB | Excellent | 13 feature specs (F-01–F-13), data models, open questions |
| `docs/DEVELOPER_GUIDE.md` | 26 KB | Excellent | Stack, conventions, step-by-step guide to adding new modules |
| `docs/USER_MANUAL.md` | 52 KB | Excellent | Full end-user guide with screenshots-ready prose and troubleshooting |
| `docs/ONBOARDING_IMPLEMENTATION.md` | 7 KB | Good | 5-step tour flow, starter data details |

### What Was Wrong (README — now fixed)

The README as-found contained six categories of inaccuracy that made the project impossible to set up:

| Inaccuracy | Impact | Fix Applied |
|---|---|---|
| Listed "PostgreSQL 13+" as a prerequisite | Users who follow this install Postgres and fail | Replaced with SQLite (the actual database) |
| Instructed users to set `NEXTAUTH_SECRET` and `NEXTAUTH_URL` | These env vars don't exist in the codebase; any developer following this fails at step 3 | Removed; replaced with actual env vars from `.env.example` |
| Showed `(auth)/` and `(dashboard)/` as route group directories | These don't exist; routes are `login/`, `setup/`, `dashboard/` | Replaced with actual directory tree from `find src/` |
| Listed `hooks/useAuth.ts`, `hooks/useOfflineSync.ts`, `hooks/useLocalStorage.ts` | None of these files exist; only `hooks/use-network-status.ts` exists | Corrected |
| Listed `services/weather.ts`, `services/notifications.ts` | `src/services/` doesn't exist | Removed |
| Listed `lib/constants.ts` and `lib/validators.ts` | Neither file exists (it's `lib/validations.ts`) | Corrected |
| Stated "Next.js 14" | `package.json` declares `"next": "^16.1.6"` | Updated to Next.js 16 |
| Claimed MIT license, no LICENSE file present | Any downstream user incorporating the code has no license grant | `LICENSE` file added |

### What Was Added (this PR)

- `README.md` — fully rewritten to match the actual codebase
- `LICENSE` — MIT
- `ASSESSMENT.md` — concise actionable report (root level, easy to find)
- `docs/ASSESSMENT_DETAILED.md` — this document

---

## 5. Market Positioning

### Competitive Landscape

| Product | Self-hosted | Offline-first | Open source | Target |
|---|---|---|---|---|
| Farmbrite | No (SaaS) | No | No | Commercial farms |
| Granular (Corteva) | No (SaaS) | Partial | No | Ag enterprise |
| AgSquared | No (SaaS) | No | No | Small farms |
| FarmHack | Partial | No | Yes | DIY farmers (tools library, not an app) |
| Notion/Airtable templates | No | No | No | Generalists |
| **HomesteadHub** | **Yes** | **Yes** | **Yes (MIT)** | **Homesteaders** |

The niche is genuinely uncontested at the intersection of all three attributes: self-hosted + offline-first + open source + homestead-specific.

### Target Persona

"Engineer-farmer-survivalist" — technically capable, values data ownership, distrusts cloud dependency, likely already running a home server or Raspberry Pi. This persona:
- Can run a Docker container without hand-holding
- Actively avoids SaaS subscriptions for critical household data
- Tends to be an evangelist for tools they trust (strong word-of-mouth potential)
- Will contribute upstream if the project is welcoming

### Strengths

1. **Offline-first is a genuine moat** — technically hard to build, commercially uncommon, and the target audience explicitly values it
2. **PIN-only auth is correct** — no email, no accounts, no cloud auth provider. Matches the persona's threat model
3. **Module breadth** — storage, garden, livestock, equipment, resources, weather, preparedness, and tasks in one integrated app. Competitors are narrower
4. **Self-hosted on Raspberry Pi** — a concrete, achievable deployment story that SaaS competitors structurally cannot offer
5. **No vendor lock-in** — SQLite file, MIT license, self-hosted. The audience values this deeply
6. **Strong internal documentation** — PRD, developer guide, and user manual at launch is unusually thorough

### Weaknesses / Risks

1. **No mobile app** — browser-only. The target audience may want home-screen access from the barn. PWA manifest would partially address this
2. **Self-hosting is also a barrier** — the flip side of the strength. Some users in the target market aren't server-comfortable
3. **No data export** — significant gap for self-reliance audience. They want to own their data in portable formats (CSV, JSON), not just in an SQLite file
4. **No backup/restore documentation** — users need to know how to protect their data; this was missing until the README rewrite
5. **Niche market size** — sustainable as open source; monetization path exists via optional hosted tier but requires separate work

### Monetization Path (if desired)

The MIT open-source base + optional hosted tier model is proven (Plausible Analytics, Umami, Gitea, etc.). Offer the same software as a managed service for users who don't want to self-host, at ~$5–10/month. The self-hosted version remains free. This is not required for the project to succeed, but it exists as a clear option.

---

## 6. Files Changed in the Accompanying PR

```
README.md              — Rewritten (6 categories of inaccuracy corrected)
LICENSE                — Created (MIT)
Dockerfile             — Created (multi-stage, Alpine, unprivileged user)
docker-compose.yml     — Created (SQLite volume, health check, env passthrough)
.gitignore             — Updated (added /data/ for Docker volume)
ASSESSMENT.md          — Created (concise actionable report)
docs/ASSESSMENT_DETAILED.md  — Created (this document)
```

---

## 7. Full Priority Action List

### Immediate — unblocks adoption
1. ~~Fix README~~ — Done
2. ~~Add Docker deployment~~ — Done
3. ~~Add LICENSE file~~ — Done
4. Add GitHub Actions CI: `npm run lint && npm test` on every push to `main`

### Short-term — before Alpha announcement
5. Switch from `db:push` to `prisma migrate` in the deployment flow — `db:push` silently drops columns on schema changes and is not safe for production data
6. Write Vitest tests for the garden, equipment, and livestock action modules (currently untested)
7. Add CSV/JSON data export to every module — high priority for the self-reliance audience and a frequent first contribution request in similar projects

### Medium-term — quality of life
8. Add a PWA manifest (`manifest.json`, icons, `theme-color`) for mobile home-screen install without a native app
9. Document the `--seed` / first-run workflow clearly for Docker users
10. Evaluate adding a `CONTRIBUTING.md` — the internal docs are strong but there is no external contributor guide

### Long-term — growth
11. Optional hosted tier (managed service) for users who don't want to self-host
12. Data import from common formats (CSV row-per-item for storage, garden, livestock)
13. Weather API integration (currently manual-entry only; the schema supports `source` and an API key field in Settings)
