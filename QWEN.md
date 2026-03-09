# HomesteadHub - Project Context

## Project Overview

**HomesteadHub** is a self-hosted, offline-first farm and homestead management system built for engineers and survivalists who take self-reliance seriously. It enables tracking of food storage, gardens, livestock, equipment, and emergency preparedness entirely on local hardware with no cloud dependency.

### Core Characteristics

- **Self-hosted**: Runs on Raspberry Pi or home server via Docker
- **Offline-first**: Full functionality without internet; changes sync when reconnected
- **Single-user**: PIN-based authentication (no accounts, no email required)
- **Zero subscriptions**: No recurring fees, no third-party API dependencies
- **Data ownership**: All data stored in a single SQLite file

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router, Server Components) |
| **Language** | TypeScript 5.4 (strict mode) |
| **Database** | SQLite via Prisma ORM (16 models) |
| **Styling** | Tailwind CSS 3.4 + Radix UI |
| **State** | TanStack React Query 5 |
| **Offline** | IndexedDB (via `idb` package) |
| **Validation** | Zod schemas |
| **Charts** | Recharts |
| **Testing** | Vitest |
| **Deployment** | Docker Compose |

## Project Structure

```
homestead-hub/
├── src/
│   ├── actions/          # Server Actions (all data mutations)
│   │   ├── auth.ts       # PIN authentication
│   │   ├── storage.ts    # Food storage CRUD
│   │   ├── tasks.ts      # Recurring tasks
│   │   ├── equipment.ts  # Equipment maintenance
│   │   ├── livestock.ts  # Animal management
│   │   ├── garden.ts     # Crop/planting management
│   │   ├── resources.ts  # Consumables tracking
│   │   ├── weather.ts    # Weather snapshots
│   │   ├── preparedness.ts # Emergency checklists
│   │   ├── notifications.ts # Alert feed
│   │   ├── settings.ts   # App configuration
│   │   └── onboarding.ts # First-run setup
│   ├── app/              # Next.js App Router
│   │   ├── login/        # PIN login page
│   │   ├── setup/        # First-run PIN setup
│   │   └── dashboard/    # Protected routes
│   │       ├── storage/
│   │       ├── garden/
│   │       ├── equipment/
│   │       ├── livestock/
│   │       ├── tasks/
│   │       ├── resources/
│   │       ├── weather/
│   │       ├── preparedness/
│   │       └── notifications/
│   ├── components/
│   │   └── ui/           # Radix-based UI primitives
│   ├── hooks/
│   │   └── use-network-status.ts  # Online/offline detection
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── offline.ts         # IndexedDB cache + mutation queue
│   │   ├── action-registry.ts # Maps action names for offline sync
│   │   ├── validations.ts     # Zod schemas for all models
│   │   └── utils.ts           # Helper functions (cn, formatters)
│   ├── middleware.ts     # Auth route protection
│   └── types/
│       └── index.ts      # Shared TypeScript types/enums
├── prisma/
│   ├── schema.prisma     # Database schema (16 models)
│   └── seed.ts           # Starter data seeding
├── docs/
│   ├── ARCHITECTURE.md   # System architecture details
│   └── PRD.md            # Product requirements document
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Database Schema (16 Models)

| Module | Models |
|--------|--------|
| **Storage** | `StorageItem` |
| **Garden** | `Crop`, `Planting` |
| **Equipment** | `Equipment`, `MaintenanceRecord` |
| **Livestock** | `Animal`, `HealthRecord`, `ProductionLog` |
| **Tasks** | `Task`, `TaskCompletion` |
| **Resources** | `ResourceLog` |
| **Weather** | `WeatherSnapshot` |
| **Preparedness** | `Checklist`, `ChecklistItem` |
| **System** | `Settings` (singleton), `Notification` |

All models use `cuid()` for IDs. Indexes exist on frequently filtered fields (`expirationDate`, `status`, `isActive`, `date`).

## Building and Running

### Prerequisites

- Node.js 18+
- Docker (for containerized deployment)

### Development Setup

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Initialize database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

### Docker Deployment (Recommended)

```bash
docker compose up -d
```

Data persists in `./data/homestead.db` — back this file up.

### Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (hot reload) |
| `npm run build` | Production build |
| `npm start` | Production server |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript type checking |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Sync schema to DB (dev) |
| `npm run db:migrate` | Create tracked migration |
| `npm run db:seed` | Seed starter data |
| `npm run db:studio` | Open Prisma Studio (port 5555) |

## Development Conventions

### Architecture Patterns

1. **Server Actions for all mutations**: All CRUD operations live in `src/actions/*.ts` files using `"use server"` directive. No REST API.

2. **Zod validation at action boundary**: All inputs validated against schemas in `src/lib/validations.ts` before database operations.

3. **Prisma singleton**: `src/lib/db.ts` implements singleton pattern to prevent multiple clients during hot reload.

4. **Offline-first design**: 
   - Read cache in IndexedDB (`keyval` store)
   - Write queue in IndexedDB (`mutationQueue` store)
   - Sync via `action-registry.ts` on reconnect
   - Last-write-wins conflict resolution

5. **Authentication**: 
   - Single bcrypt-hashed PIN stored in `Settings`
   - Session cookie (`homestead-session`) with configurable TTL
   - Middleware guards all `/dashboard/*` routes

### Code Style

- **TypeScript**: Strict mode enabled
- **Imports**: Path aliases via `@/*` → `./src/*`
- **Naming**: 
  - Server actions: `create*`, `update*`, `delete*`, `get*`
  - Components: PascalCase
  - Files: kebab-case or matching component name
- **Error handling**: Server actions return `{ success: boolean; error?: string }`

### Testing

- **Framework**: Vitest with React Testing Library
- **Location**: `src/test/` for setup, co-located `*.test.ts` files
- **Mocking**: `vitest-mock-extended` for Prisma mocks

### Design System

**Color Palette** (Tailwind extended colors):
- `earth` — Warm beige-brown (headings)
- `soil` — Neutral warm gray (backgrounds)
- `forest` — Muted green (primary actions, success)
- `harvest` — Golden amber (storage accent, warnings)
- `barn` — Red (livestock accent, errors)

**UI Components**: Radix UI primitives (Dialog, Select, Tabs, Checkbox, Progress) styled with Tailwind.

## Key Files Reference

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema definition |
| `src/lib/db.ts` | Prisma client singleton |
| `src/lib/validations.ts` | Zod schemas for all models |
| `src/lib/offline.ts` | IndexedDB operations |
| `src/lib/action-registry.ts` | Action mapping for offline sync |
| `src/middleware.ts` | Route authentication |
| `src/types/index.ts` | Shared TypeScript types |
| `docs/ARCHITECTURE.md` | Detailed system architecture |
| `docs/PRD.md` | Product requirements |

## Authentication Flow

1. **First run**: User sets PIN at `/setup` → bcrypt hash stored in `Settings`
2. **Login**: PIN entered at `/login` → compared via `bcrypt.compare()` → session cookie set
3. **Protected routes**: `middleware.ts` checks cookie → redirects to `/login` if absent
4. **Session TTL**: Configurable in Settings (default 7 days)

## Offline Sync Flow

```
[User Action] → [Network Check]
     │
     ├─ Online → Server Action → DB → revalidatePath
     │
     └─ Offline → Queue in IndexedDB → SyncIndicator shows pending
                  │
                  └─ On Reconnect → replay queue via action-registry
```

## Backup Strategy

All data lives in `./data/homestead.db`. Backup is a file copy:

```bash
# Backup
cp ./data/homestead.db ./backups/homestead-$(date +%Y%m%d).db

# Restore
cp ./backups/homestead-20260101.db ./data/homestead.db
```

## Related Documentation

- [README.md](./README.md) — User-facing documentation
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — System architecture deep-dive
- [docs/PRD.md](./docs/PRD.md) — Product requirements
- [ASSESSMENT.md](./ASSESSMENT.md) — Project status and roadmap
