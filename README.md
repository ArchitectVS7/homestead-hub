# HomesteadHub

A self-hosted, offline-first farm and homestead management system built for the engineer-farmer-survivalist who takes self-reliance seriously. Track food storage, gardens, livestock, equipment, and emergency preparedness — entirely on your own hardware, with no cloud dependency.

## Features

- **Emergency Food Storage** — Track inventory, expiration dates, and rotation schedules
- **Garden Planning** — Planting calendars, crop management, and harvest tracking
- **Equipment Maintenance** — Service schedules, repair history, and maintenance logs
- **Livestock Management** — Health records, breeding lineage, and production logs
- **Weather Logging** — Local snapshots and historical tracking
- **Task Scheduling** — Daily, weekly, monthly, quarterly, and annual recurring tasks
- **Resource Tracking** — Monitor water, fuel, seeds, feed, and other consumables
- **Emergency Preparedness** — Checklists and readiness assessments
- **Offline-First** — Full functionality without internet; changes sync automatically when reconnected

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Components)
- **Language**: TypeScript (strict mode)
- **Database**: SQLite via Prisma ORM (single file, no database server required)
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: TanStack React Query
- **Offline Persistence**: IndexedDB
- **Authentication**: bcrypt PIN (no accounts, no email required)

## Quick Start (Docker — recommended)

The fastest path to a running instance on your own hardware:

```bash
git clone https://github.com/ArchitectVS7/homestead-hub
cd homestead-hub
cp .env.example .env
docker compose up -d
```

Open [http://localhost:3000](http://localhost:3000) and create your PIN on first launch.

Your data lives in `./data/homestead.db` — back it up like any other file.

## Manual Installation

### Prerequisites

- Node.js 18 or higher
- npm (or pnpm / yarn)

No database server is required. HomesteadHub uses SQLite (a single file on disk).

### Steps

1. Clone and install dependencies:
   ```bash
   git clone https://github.com/ArchitectVS7/homestead-hub
   cd homestead-hub
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```

   The defaults in `.env.example` work out of the box. The only required variable is:
   ```
   DATABASE_URL="file:./prisma/homestead.db"
   ```

3. Initialize the database:
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. Start the server:
   ```bash
   npm run dev      # development (hot reload)
   # or
   npm run build && npm start   # production
   ```

5. Open [http://localhost:3000](http://localhost:3000) and create your PIN.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `file:./prisma/homestead.db` | Path to the SQLite database file |
| `NEXT_PUBLIC_APP_NAME` | `HomesteadHub` | Display name shown in the UI |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Base URL of your instance |

No external services, API keys, or third-party accounts are required.

## Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest test suite |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:push` | Sync schema to database (development) |
| `npm run db:migrate` | Create a tracked migration (production) |
| `npm run db:seed` | Seed example starter data |
| `npm run db:studio` | Open Prisma Studio GUI on port 5555 |

## Project Structure

```
homestead-hub/
├── src/
│   ├── actions/          # Server Actions — all data mutations live here
│   │   ├── auth.ts
│   │   ├── storage.ts
│   │   ├── tasks.ts
│   │   ├── equipment.ts
│   │   ├── livestock.ts
│   │   ├── garden.ts
│   │   ├── resources.ts
│   │   ├── weather.ts
│   │   ├── preparedness.ts
│   │   └── notifications.ts
│   ├── app/              # Next.js App Router pages
│   │   ├── login/        # PIN login page
│   │   ├── setup/        # First-run PIN setup
│   │   └── dashboard/    # Protected application routes
│   │       ├── page.tsx  # Main dashboard overview
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
│   │   └── ui/           # Reusable UI primitives (button, dialog, select, table, etc.)
│   ├── hooks/
│   │   └── use-network-status.ts   # Online/offline detection
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── offline.ts         # IndexedDB cache + mutation queue
│   │   ├── action-registry.ts # Maps action names for offline sync
│   │   ├── validations.ts     # Zod schemas for all data models
│   │   └── utils.ts           # Helper functions
│   ├── middleware.ts      # Auth route protection (redirects to /login)
│   └── types/
│       └── index.ts       # Shared TypeScript types and enums
├── prisma/
│   ├── schema.prisma      # Database schema (16 models)
│   ├── seed.ts            # Example starter data
│   └── seed-starter-data.ts
├── docs/
│   ├── PRD.md             # Product requirements document
│   ├── DEVELOPER_GUIDE.md # Developer patterns and conventions
│   └── USER_MANUAL.md     # End-user documentation
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── ASSESSMENT.md          # Project status and roadmap
```

## Database Schema

The schema is defined in `prisma/schema.prisma` (16 models):

- **Settings** — Singleton record for PIN, preferences, location, and API keys
- **StorageItem** — Food inventory with expiration tracking
- **Crop / Planting** — Garden planning with companion plant support
- **Equipment / MaintenanceRecord** — Service scheduling by hours or days
- **Animal / HealthRecord / ProductionLog** — Livestock with breeding lineage
- **Task / TaskCompletion** — Recurring tasks using iCal RRULE format
- **ResourceLog** — Water, fuel, seeds, and feed consumption
- **WeatherSnapshot** — Manual or API-sourced weather records
- **Checklist / ChecklistItem** — Emergency preparedness with template support
- **Notification** — Cross-module alert feed

Inspect the live schema with:
```bash
npm run db:studio
```

## Authentication

HomesteadHub uses a single PIN — no user accounts, no email, no OAuth. On first launch you set a PIN; it is bcrypt-hashed and stored in the database. A session cookie keeps you logged in for a configurable number of days (default: 7, adjustable in Settings). There is no password recovery by design; this is a local-first, single-household application.

## Offline Functionality

All data is cached in IndexedDB in the browser. When you make changes while offline, they are queued locally and replayed against the server when connectivity is restored. Conflict resolution uses last-write-wins by timestamp. The sync indicator in the UI shows pending queue status.

## Backup

All data is stored in a single SQLite file. Backup is a file copy:

```bash
# Manual backup
cp ./data/homestead.db ./backups/homestead-$(date +%Y%m%d).db

# Restore
cp ./backups/homestead-20260101.db ./data/homestead.db
```

Schedule this with cron for automated backups.

## Documentation

- [Product Requirements (PRD)](docs/PRD.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [User Manual](docs/USER_MANUAL.md)
- [Project Assessment](ASSESSMENT.md)

## License

MIT — see [LICENSE](LICENSE).

---

Built for self-reliant living.
