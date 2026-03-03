# HomesteadHub — Product Requirements Document

> **Status:** Draft
> **Version:** 1.0
> **Last Updated:** 2026-02-05
> **Author:** Reverse-engineered from codebase

---

## Executive Summary

HomesteadHub is a self-hosted, offline-capable web application for managing a farm or homestead. It is designed for a single technically capable homesteader who wants complete control over food storage, garden planning, equipment maintenance, livestock management, weather tracking, task scheduling, resource monitoring, and emergency preparedness. It solves the problem of cloud dependency and subscription lock-in by running entirely on local hardware with no third-party data access. The product is considered complete when all eight management modules are functional, offline-capable, and deployable via Docker or Node.js on commodity hardware.

---

## Overview

HomesteadHub was reverse-engineered from an existing codebase as of 2026-02-05. It is a single-user system targeting the engineer-farmer-survivalist who is comfortable running `docker compose up` or `npm run dev` on a local machine.

The core hypothesis is that a homesteader should not need cloud services, recurring subscriptions, or third-party access to manage the full operational complexity of a homestead. Everything — food storage, crops, animals, equipment, weather, tasks, resources, and emergency preparedness — should be manageable from a single local application that works without an internet connection.

HomesteadHub is a standalone application. It has no integration with external SaaS platforms by design. It runs on any hardware capable of hosting a Node.js server, including a Raspberry Pi, an old laptop, or a home server.

The application is built on Next.js 14 (App Router) with a PostgreSQL database managed via Prisma, and uses IndexedDB on the client for offline-first caching and queued writes. A simple PIN/password gate provides lightweight access control appropriate for a single-user system on a LAN.

---

## Goals

- Provide full homestead management functionality — food storage, garden planning, equipment maintenance, livestock management, weather tracking, task scheduling, resource monitoring, and emergency preparedness — within a single self-hosted application.
- Operate with full functionality offline, using IndexedDB for client-side caching and queued writes that sync when a connection is available.
- Run on commodity hardware (Raspberry Pi, old laptop, home server) with no cloud dependencies and no recurring fees.
- Require no more than a single `docker compose up` or `npm run dev` command to deploy.
- Enforce zero third-party data access — all data remains on the user's own hardware.
- Provide a simple PIN/password access gate sufficient to prevent casual LAN access without the overhead of a full authentication system.

---

## Non-Goals

- **No multi-user or multi-tenancy support** — the system is explicitly single-user; no role-based access, no shared accounts.
- **No cloud hosting or SaaS offering** — the product will not be offered as a hosted service.
- **No OAuth, JWT, or session-based authentication** — access control is a lightweight PIN/password gate only.
- **No static export** — `output: 'export'` is intentionally disabled in `next.config.js`; the app requires a live Node.js server for Server Actions and Prisma.
- **No tRPC** — the README references tRPC but `package.json` has no tRPC dependency; Server Actions are the correct and only path forward.
- **No external API integrations** — weather and all other data are managed locally; no third-party data feeds.
- **No mobile native application** — the product is a web application only.

---

## User Stories

### Personas

**The Homesteader:** A single person or household managing a working farm or homestead. Technically capable enough to run a Docker container or Node.js application on local hardware. Values self-sufficiency, data ownership, and offline reliability over convenience features that require cloud connectivity.

### Stories

- As a **homesteader**, I want to track food storage inventory so that I know what supplies I have and when they expire.
- As a **homesteader**, I want to plan and monitor garden crops and plantings so that I can manage growing seasons effectively.
- As a **homesteader**, I want to log equipment maintenance records so that I can keep machinery in working order and anticipate service needs.
- As a **homesteader**, I want to manage livestock records — including health records, production logs, and lineage — so that I have a complete picture of my animals.
- As a **homesteader**, I want to schedule and track tasks so that recurring and one-off work does not fall through the cracks.
- As a **homesteader**, I want to monitor resource usage so that I can track consumption of water, fuel, and other inputs.
- As a **homesteader**, I want to log local weather snapshots so that I have a historical record tied to my specific location.
- As a **homesteader**, I want to manage emergency preparedness checklists so that I can maintain readiness for off-grid or crisis scenarios.
- As a **homesteader**, I want the application to work fully offline so that a loss of internet connectivity does not interrupt my ability to read or record information.

---

## Architecture

### Tech Stack

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

### Architectural Decisions

| Decision | Rationale |
|---|---|
| **Server Actions over tRPC** | Zero extra dependencies; built into Next.js 14 App Router. README mentions tRPC but `package.json` has no tRPC dep. Server Actions are the correct path forward. |
| **Simple PIN/password gate** | Single-user system; no OAuth, no sessions, no JWT. A lightweight gate to prevent casual access on a LAN. |
| **No static export** | `output: 'export'` is commented out in `next.config.js`. The app needs a Node.js server for Server Actions + Prisma. |

### Navigation Structure

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

### Design System

**Color palette** (Tailwind extended colors, 50–950 scale each):

- `earth` — warm beige-brown (headings, landing page)
- `soil` — neutral warm gray (backgrounds, text, borders — primary dashboard chrome)
- `forest` — muted green (primary action color, active states, success)
- `harvest` — golden amber (storage module accent, warnings)
- `barn` — red (livestock accent, errors, destructive actions)

**Component tokens** (defined in `globals.css`):

- `.btn-primary` — `forest-600` bg, white text
- `.btn-secondary` — `
