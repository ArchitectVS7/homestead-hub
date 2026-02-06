/**
 * Authentication Module - Server Actions
 *
 * Handles PIN-based authentication for HomesteadHub:
 * - First-time PIN setup
 * - Login/logout with PIN verification
 * - Session management via HTTP-only cookies
 * - PIN changes (requires current PIN)
 *
 * Security Features:
 * - bcrypt password hashing (SALT_ROUNDS = 10)
 * - HTTP-only secure cookies (no client-side JS access)
 * - Session expiration based on TTL settings
 * - No password recovery (by design for offline-first)
 *
 * Design Philosophy:
 * This is NOT OAuth or JWT. It's a simple PIN system designed for:
 * - Self-hosted environments
 * - Offline-first operation
 * - Single-user or trusted multi-user scenarios
 * - No external authentication dependencies
 *
 * Related:
 * - Setup UI: src/app/setup/page.tsx
 * - Login UI: src/app/login/page.tsx
 * - Settings: src/app/dashboard/settings/settings-view.tsx
 * - Middleware: Consider adding route protection middleware
 */

"use server";

import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { z } from "zod";

// bcrypt salt rounds - higher = more secure but slower
// 10 rounds is a good balance for PIN hashing
const SALT_ROUNDS = 10;

// Cookie name for session management
const SESSION_COOKIE_NAME = "homestead-session";

// Validation: Minimum 4 characters for PIN
// Users are encouraged to use longer PINs for better security
const PINSchema = z.string().min(4, "PIN must be at least 4 characters");

/**
 * Get or create the singleton Settings record
 *
 * Settings is a singleton (only one record ever exists) storing:
 * - Hashed PIN for authentication
 * - Session TTL preferences
 * - Onboarding status
 * - System preferences (units, zones, etc.)
 *
 * @returns The Settings record (creates if doesn't exist)
 */
async function getSettings() {
  let settings = await db.settings.findFirst();

  if (!settings) {
    // Create with defaults if doesn't exist (first run)
    settings = await db.settings.create({
      data: {},
    });
  }

  return settings;
}

/**
 * Check if a PIN has been set up
 *
 * @returns true if PIN exists, false if not (first-time setup needed)
 *
 * Used by:
 * - Root layout to redirect to /setup if no PIN
 * - Middleware to protect routes
 */
export async function hasPINSetup(): Promise<boolean> {
  const settings = await getSettings();
  return !!settings.hashedPIN; // Double-bang converts to boolean
}

/**
 * Set up the initial PIN (first-time setup only)
 *
 * @param pin - User's chosen PIN (minimum 4 characters)
 * @returns Success status and optional error message
 *
 * Security Flow:
 * 1. Validates PIN length (Zod schema)
 * 2. Checks if PIN already exists (prevents re-setup)
 * 3. Hashes PIN with bcrypt (never stores plaintext)
 * 4. Stores hash in settings
 * 5. Creates authenticated session
 * 6. Redirects to dashboard (handled by UI)
 *
 * Important: No password recovery by design
 * Users must remember their PIN or have database access to reset
 */
export async function setupPIN(pin: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate PIN using Zod schema (throws if invalid)
    PINSchema.parse(pin);

    // Prevent overwriting existing PIN
    const settings = await getSettings();
    if (settings.hashedPIN) {
      return { success: false, error: "PIN already set up" };
    }

    // Hash the PIN using bcrypt (async, secure)
    // Never store plaintext passwords/PINs
    const hashedPIN = await bcrypt.hash(pin, SALT_ROUNDS);

    // Store hashed PIN in settings
    await db.settings.update({
      where: { id: settings.id },
      data: { hashedPIN },
    });

    // Create authenticated session (HTTP-only cookie)
    await createSession(settings.sessionTTLDays);

    return { success: true };
  } catch (error) {
    // Handle Zod validation errors specifically
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Setup PIN error:", error);
    return { success: false, error: "Failed to set up PIN" };
  }
}

/**
 * Login with PIN
 */
export async function login(pin: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate PIN
    PINSchema.parse(pin);

    const settings = await getSettings();

    if (!settings.hashedPIN) {
      return { success: false, error: "No PIN set up" };
    }

    // Verify PIN
    const isValid = await bcrypt.compare(pin, settings.hashedPIN);

    if (!isValid) {
      return { success: false, error: "Invalid PIN" };
    }

    // Create session
    await createSession(settings.sessionTTLDays);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Login error:", error);
    return { success: false, error: "Login failed" };
  }
}

/**
 * Logout (clear session)
 */
export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}

/**
 * Check if user has a valid session
 */
export async function checkSession(): Promise<boolean> {
  const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME);
  return !!sessionCookie;
}

/**
 * Change PIN (requires current PIN)
 */
export async function changePIN(
  currentPIN: string,
  newPIN: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate both PINs
    PINSchema.parse(currentPIN);
    PINSchema.parse(newPIN);

    const settings = await getSettings();

    if (!settings.hashedPIN) {
      return { success: false, error: "No PIN set up" };
    }

    // Verify current PIN
    const isValid = await bcrypt.compare(currentPIN, settings.hashedPIN);

    if (!isValid) {
      return { success: false, error: "Current PIN is incorrect" };
    }

    // Hash new PIN
    const hashedPIN = await bcrypt.hash(newPIN, SALT_ROUNDS);

    // Update PIN
    await db.settings.update({
      where: { id: settings.id },
      data: { hashedPIN },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Change PIN error:", error);
    return { success: false, error: "Failed to change PIN" };
  }
}

/**
 * Helper: Create authenticated session cookie
 *
 * @param ttlDays - Time to live in days (from settings, default 7)
 *
 * Cookie Security Settings:
 * - httpOnly: true - Prevents JavaScript access (XSS protection)
 * - secure: true in production - Requires HTTPS
 * - sameSite: "lax" - CSRF protection while allowing external navigation
 * - maxAge: Expires after TTL days
 * - path: "/" - Available site-wide
 *
 * The cookie value itself doesn't matter (just "authenticated")
 * Its presence indicates valid session, not the value
 *
 * Future Enhancement: Consider using signed cookies or JWT for
 * additional security in multi-user scenarios
 */
async function createSession(ttlDays: number): Promise<void> {
  const maxAge = ttlDays * 24 * 60 * 60; // Convert days to seconds

  (await cookies()).set({
    name: SESSION_COOKIE_NAME,
    value: "authenticated", // Value doesn't matter, presence = authenticated
    httpOnly: true, // Can't access from JavaScript (security)
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax", // CSRF protection
    maxAge, // Auto-expires after TTL
    path: "/", // Available to all routes
  });
}
