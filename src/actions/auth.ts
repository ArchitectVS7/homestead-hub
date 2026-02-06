"use server";

import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { z } from "zod";

const SALT_ROUNDS = 10;
const SESSION_COOKIE_NAME = "homestead-session";

// Validation schemas
const PINSchema = z.string().min(4, "PIN must be at least 4 characters");

/**
 * Get or create the singleton Settings record
 */
async function getSettings() {
  let settings = await db.settings.findFirst();

  if (!settings) {
    settings = await db.settings.create({
      data: {},
    });
  }

  return settings;
}

/**
 * Check if a PIN has been set up
 */
export async function hasPINSetup(): Promise<boolean> {
  const settings = await getSettings();
  return !!settings.hashedPIN;
}

/**
 * Set up the initial PIN (first-time setup)
 */
export async function setupPIN(pin: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate PIN
    PINSchema.parse(pin);

    // Check if PIN already exists
    const settings = await getSettings();
    if (settings.hashedPIN) {
      return { success: false, error: "PIN already set up" };
    }

    // Hash the PIN
    const hashedPIN = await bcrypt.hash(pin, SALT_ROUNDS);

    // Store hashed PIN
    await db.settings.update({
      where: { id: settings.id },
      data: { hashedPIN },
    });

    // Create session
    await createSession(settings.sessionTTLDays);

    return { success: true };
  } catch (error) {
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
 * Helper: Create session cookie
 */
async function createSession(ttlDays: number): Promise<void> {
  const maxAge = ttlDays * 24 * 60 * 60; // Convert days to seconds

  (await cookies()).set({
    name: SESSION_COOKIE_NAME,
    value: "authenticated",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  });
}
