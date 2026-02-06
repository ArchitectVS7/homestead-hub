# HomesteadHub

Complete farm and homestead management system built for the engineer-farmer-survivalist who takes self-reliance seriously.

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
- **API**: Server Actions
- **Persistence**: IndexedDB (client-side caching)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm/npm/yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/ArchitectVS7/homestead-hub
      ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
 
   ```

4. Initialize the database:
   ```
   npm run db:push
   npm run db:seed
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── actions/               # Server Actions (Backend Logic)
├── app/                   # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected app routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # Shared UI primitives
│   └── [feature]/         # Feature-specific components
├── lib/                   # Utilities and configurations
│   ├── db.ts              # Prisma client
│   ├── offline.ts         # Offline sync logic
│   └── utils.ts           # Helper functions
├── hooks/                 # Custom React hooks
├── services/              # External API integrations
└── types/                 # TypeScript type definitions
```

## Database Schema

See `prisma/schema.prisma` for the complete data model.

## License

MIT

---

Built with 🌿 for self-reliant living.
