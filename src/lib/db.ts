/**
 * Prisma Database Client Configuration
 *
 * This file configures and exports the Prisma database client for use
 * throughout the application. It implements a singleton pattern to prevent
 * multiple client instances in development (hot reload issue).
 *
 * Key Features:
 * - Singleton pattern prevents multiple Prisma instances
 * - Different logging levels for dev vs production
 * - Global caching to survive Next.js hot reloads
 *
 * Database Setup:
 * - Default: SQLite (file: prisma/homestead.db)
 * - Configurable: PostgreSQL via DATABASE_URL env var
 * - See: prisma/schema.prisma for data model
 *
 * Usage:
 * ```typescript
 * import { db } from "@/lib/db"
 *
 * // Query example
 * const items = await db.storageItem.findMany()
 *
 * // Create example
 * await db.storageItem.create({ data: { ... } })
 * ```
 *
 * Important:
 * - Always use 'db' export, never create new PrismaClient instances
 * - Run `npm run db:push` after schema changes
 * - Run `npm run db:generate` to regenerate client types
 */

import { PrismaClient } from "@prisma/client";

// Type-safe global variable for Prisma client caching
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton Prisma Client
 *
 * In development: Reuses existing client from global cache to prevent
 *   "Too many Prisma clients" error during Next.js hot reload
 *
 * In production: Creates new client (no hot reload concerns)
 *
 * Logging Configuration:
 * - Development: Logs queries, errors, and warnings (helpful for debugging)
 * - Production: Only logs errors (performance and security)
 */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"] // Verbose logging in dev
        : ["error"], // Minimal logging in production
  });

// Cache the client globally in development to survive hot reloads
// This prevents "Unable to acquire a connection from the pool" errors
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
