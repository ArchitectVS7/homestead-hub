```markdown
# HomesteadHub

A complete farm and homestead management system built for the engineer-farmer-survivalist who takes self-reliance seriously. HomesteadHub provides offline-first functionality, comprehensive tracking for food storage, gardens, livestock, and equipment, and works seamlessly without internet connectivity through automatic synchronization.

## Features

- 🏪 **Emergency Food Storage** - Track inventory, expiration dates, and rotation schedules
- 🌱 **Garden Planning** - Planting calendars, crop management, and harvest tracking
- 🔧 **Equipment Maintenance** - Service schedules, repair history, and parts inventory
- 🐄 **Livestock Management** - Health records, breeding, and production logs
- ☁️ **Weather Integration** - Local forecasts, alerts, and historical tracking
- 📋 **Task Scheduling** - Daily, weekly, monthly, quarterly, and annual recurring tasks
- 💧 **Resource Tracking** - Monitor water, fuel, seeds, feed, and other consumables
- 🛡️ **Emergency Preparedness** - Checklists and readiness assessments
- 📶 **Offline-First** - Full functionality without internet connectivity via automatic syncing

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: TanStack React Query
- **Persistence**: IndexedDB (client-side caching)
- **Authentication**: bcrypt

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 13 or higher
- pnpm, npm, or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ArchitectVS7/homestead-hub
   cd homestead-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following in `.env.local`:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Secret key for authentication
   - `NEXTAUTH_URL` - Application URL (e.g., http://localhost:3000)

4. Set up the database:
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Run linting**: `npm lint`
- **Generate Prisma types**: `npm run db:generate`
- **Sync schema with database**: `npm run db:push`
- **Create database migration**: `npm run db:migrate`
- **Seed sample data**: `npm run db:seed`
- **Open Prisma Studio**: `npm run db:studio`

### Core Workflows

**Add a New Task**
- Navigate to the dashboard
- Click "New Task" in the Task Scheduling section
- Select recurrence pattern (daily, weekly, monthly, quarterly, annual)
- Set reminders and assign to responsible party

**Manage Food Inventory**
- Go to Emergency Food Storage
- Add items with quantity, expiration date, and storage location
- System tracks rotation schedules and alerts on expiration
- Works offline with automatic sync when reconnected

**Track Livestock Health**
- Access Livestock Management dashboard
- Log health records, breeding events, and production metrics
- Maintain vaccination schedules and medical history
- Generate reports for veterinary reference

## Project Structure

```
src/
├── actions/                    # Server Actions (Backend Logic)
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Authentication pages and routes
│   ├── (dashboard)/            # Protected application routes
│   │   ├── page.tsx            # Main dashboard
│   │   ├── storage/            # Food storage management
│   │   ├── garden/             # Garden planning interface
│   │   ├── equipment/          # Equipment maintenance tracking
│   │   ├── livestock/          # Livestock management
│   │   ├── weather/            # Weather integration
│   │   ├── tasks/              # Task scheduling
│   │   ├── resources/          # Resource tracking
│   │   └── preparedness/       # Emergency preparedness
│   ├── api/                    # API routes
│   └── layout.tsx              # Root layout with providers
├── components/                 # React Components
│   ├── ui/                     # Reusable UI primitives (buttons, dialogs, etc.)
│   ├── dashboard/              # Dashboard-specific components
│   ├── storage/                # Food storage components
│   ├── garden/                 # Garden planning components
│   ├── equipment/              # Equipment tracking components
│   ├── livestock/              # Livestock management components
│   ├── weather/                # Weather display components
│   ├── tasks/                  # Task scheduling components
│   ├── resources/              # Resource tracking components
│   └── layout/                 # Layout components (header, sidebar, nav)
├── hooks/                      # Custom React Hooks
│   ├── useOfflineSync.ts       # Offline synchronization logic
│   ├── useAuth.ts              # Authentication context hook
│   └── useLocalStorage.ts      # IndexedDB persistence hook
├── lib/                        # Utilities and Configuration
│   ├── db.ts                   # Prisma client singleton
│   ├── offline.ts              # Offline-first sync engine
│   ├── utils.ts                # Helper functions
│   ├── constants.ts            # Application constants
│   └── validators.ts           # Input validation schemas
├── services/                   # External Integrations
│   ├── weather.ts              # Weather API integration
│   └── notifications.ts        # Notification service
├── types/                      # TypeScript Type Definitions
│   └── index.ts                # Shared types and interfaces
└── middleware.ts               # Next.js middleware (auth verification)
```

## Database Schema

The database schema is defined in `prisma/schema.prisma` and includes:

- **Users & Auth** - User accounts with encrypted credentials
- **Storage** - Food items with inventory levels and expiration tracking
- **Gardens** - Planting zones, crops, and harvest schedules
- **Equipment** - Machinery and tools with maintenance schedules
- **Livestock** - Animals with health records and production logs
- **Tasks** - Recurring tasks with scheduling rules
- **Resources** - Consumable tracking (water, fuel, feed, seeds)
- **Weather** - Historical weather data and forecasts

View the complete schema by opening Prisma Studio:
```bash
npm run db:studio
```

## Offline Functionality

HomesteadHub uses IndexedDB for local caching and automatic synchronization:

- All data is cached locally in the browser
- Changes sync automatically when connectivity is restored
- Conflict resolution uses last-write-wins strategy
- Works completely offline for view, create, and update operations

## License

MIT

---

Built with 🌿 for self-reliant living.
```