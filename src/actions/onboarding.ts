/**
 * Onboarding Module - Server Actions
 *
 * Manages the first-time user experience and example data:
 * - 5-step interactive tour on first login
 * - Optional starter/example data loading
 * - Safe cleanup of example data
 *
 * Key Features:
 * - Tracks onboarding completion in settings
 * - Loads comprehensive example data across all modules
 * - Tagged deletion (only removes starter data, preserves user data)
 *
 * Workflow:
 * 1. User completes setup → redirected to dashboard
 * 2. Onboarding tour automatically appears (if not completed)
 * 3. User chooses to load example data or start empty
 * 4. Settings tracks completion and data status
 * 5. User can later clear example data from Settings page
 *
 * Related:
 * - UI: src/components/onboarding-tour.tsx
 * - Wrapper: src/app/dashboard/onboarding-wrapper.tsx
 * - Data: prisma/seed-starter-data.ts
 * - Settings UI: src/app/dashboard/settings/settings-view.tsx
 */

"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { seedStarterData, clearStarterData } from "../../prisma/seed-starter-data";

/**
 * Retrieves onboarding status from settings
 *
 * @returns Object containing onboarding completion and starter data status
 *
 * Used by:
 * - Dashboard page to determine if tour should show
 * - Settings page to show data management options
 */
export async function getOnboardingStatus() {
  try {
    const settings = await db.settings.findFirst();

    if (!settings) {
      // No settings exist yet (fresh install)
      return {
        onboardingCompleted: false,
        hasStarterData: false,
      };
    }

    return {
      onboardingCompleted: settings.onboardingCompleted,
      hasStarterData: settings.hasStarterData,
    };
  } catch (error) {
    console.error("Failed to get onboarding status:", error);
    return {
      onboardingCompleted: false,
      hasStarterData: false,
    };
  }
}

/**
 * Completes the onboarding tour and optionally loads starter data
 *
 * @param loadStarterData - Whether to load example data across all modules
 * @returns Success status and optional error message
 *
 * This function is called when user finishes the 5-step tour
 * and makes their decision about example data.
 *
 * If loadStarterData is true, seeds:
 * - 12 storage items (various categories and expiration dates)
 * - 4 crops with 3 plantings
 * - 4 equipment items with maintenance records
 * - 5 animals (chickens & goats) with health/production logs
 * - 7 tasks in various states (todo, in-progress, completed)
 * - Resource consumption logs
 * - Emergency preparedness checklist
 *
 * All starter data is tagged with isStarterData: true for safe deletion later
 */
export async function completeOnboarding(
  loadStarterData: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    let settings = await db.settings.findFirst();

    // Create settings record if it doesn't exist (shouldn't happen, but safety check)
    if (!settings) {
      settings = await db.settings.create({
        data: {},
      });
    }

    // Load comprehensive example data if requested
    // See prisma/seed-starter-data.ts for details
    if (loadStarterData) {
      await seedStarterData(db);
    }

    // Mark onboarding as complete so tour doesn't show again
    await db.settings.update({
      where: { id: settings.id },
      data: {
        onboardingCompleted: true,
        hasStarterData: loadStarterData,
      },
    });

    // Refresh dashboard to reflect new state
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    return { success: false, error: "Failed to complete onboarding" };
  }
}

export async function loadStarterData(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await seedStarterData(db);

    const settings = await db.settings.findFirst();
    if (settings) {
      await db.settings.update({
        where: { id: settings.id },
        data: { hasStarterData: true },
      });
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to load starter data:", error);
    return { success: false, error: "Failed to load starter data" };
  }
}

/**
 * Safely removes all starter/example data from the system
 *
 * @returns Success status and optional error message
 *
 * Safety Features:
 * - Only deletes items where isStarterData === true
 * - User-created data is completely safe and untouched
 * - Deletion respects foreign key constraints (correct order)
 * - Updates settings to reflect cleared state
 *
 * Deletion Order (important for foreign keys):
 * 1. Child records (task completions, checklist items, etc.)
 * 2. Parent records (tasks, checklists, etc.)
 * 3. Independent records (storage, resources)
 * 4. Update settings flag
 *
 * This function is called from Settings > Data Management
 * with a confirmation dialog showing exactly what will be deleted
 */
export async function removeStarterData(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Deletes all records tagged with isStarterData: true
    // See prisma/seed-starter-data.ts clearStarterData() for implementation
    await clearStarterData(db);

    // Revalidate all affected pages to refresh cached data
    // Next.js will re-fetch data on next visit
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/storage");
    revalidatePath("/dashboard/livestock");
    revalidatePath("/dashboard/equipment");
    revalidatePath("/dashboard/garden");
    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard/resources");
    revalidatePath("/dashboard/preparedness");

    return { success: true };
  } catch (error) {
    console.error("Failed to remove starter data:", error);
    return { success: false, error: "Failed to remove starter data" };
  }
}

export async function skipOnboarding(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    let settings = await db.settings.findFirst();

    if (!settings) {
      settings = await db.settings.create({
        data: {},
      });
    }

    await db.settings.update({
      where: { id: settings.id },
      data: { onboardingCompleted: true },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to skip onboarding:", error);
    return { success: false, error: "Failed to skip onboarding" };
  }
}
