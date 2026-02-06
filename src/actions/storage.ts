/**
 * Storage Module - Server Actions
 *
 * Manages emergency food storage inventory tracking. This module handles:
 * - CRUD operations for storage items (grains, canned goods, freeze-dried, etc.)
 * - Expiration date monitoring and alerts
 * - Category-based filtering and search
 * - Rotation scheduling (FIFO method)
 *
 * Key Features:
 * - Automatic expiration alerts based on warning threshold
 * - Support for various storage categories and locations
 * - Calorie tracking for emergency planning
 * - Search and filter capabilities
 *
 * Related:
 * - UI: src/app/dashboard/storage/storage-view.tsx
 * - Schema: prisma/schema.prisma (StorageItem model)
 * - Validations: src/lib/validations.ts
 */

"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CreateStorageItemSchema, UpdateStorageItemSchema } from "@/lib/validations";
import { z } from "zod";

/**
 * StorageItem interface matching the database schema
 * Used for type-safe operations throughout the storage module
 */
export interface StorageItem {
    id: string;
    name: string;
    category: string; // grains, legumes, canned, freeze-dried, etc.
    quantity: number;
    unit: string; // lbs, oz, gallons, cans, bags, etc.
    location: string | null; // physical storage location
    purchaseDate: Date | null;
    expirationDate: Date | null; // critical for rotation alerts
    calories: number | null; // per unit, for emergency planning
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Retrieves storage items with optional filtering
 *
 * @param filters - Optional filters for category and search
 * @param filters.category - Filter by storage category (or "all" for no filter)
 * @param filters.search - Search term for item names (case-insensitive)
 * @returns Array of storage items, sorted by expiration date (soonest first) then name
 *
 * Usage:
 * - getStorageItems() // Get all items
 * - getStorageItems({ category: "grains" }) // Get only grains
 * - getStorageItems({ search: "rice" }) // Search for rice items
 * - getStorageItems({ category: "canned", search: "tomato" }) // Combined filters
 */
export async function getStorageItems(filters?: {
    category?: string;
    search?: string;
}): Promise<StorageItem[]> {
    // Build dynamic where clause based on provided filters
    const where: any = {};

    // Category filter (skip if "all" or not provided)
    if (filters?.category && filters.category !== "all") {
        where.category = filters.category;
    }

    // Search filter - matches item name (case-insensitive partial match)
    if (filters?.search) {
        where.name = {
            contains: filters.search,
            mode: "insensitive",
        };
    }

    const items = await db.storageItem.findMany({
        where,
        orderBy: [
            { expirationDate: "asc" }, // Show expiring soonest first (FIFO rotation)
            { name: "asc" },
        ],
    });

    return items;
}

/**
 * Creates a new storage item
 *
 * @param data - Storage item data validated against CreateStorageItemSchema
 * @returns Success status and optional error message
 *
 * Workflow:
 * 1. Validates input data using Zod schema (type safety + validation)
 * 2. Creates database record
 * 3. Revalidates cache for storage page (Next.js server-side optimization)
 * 4. Returns success/error result
 *
 * Note: Validation errors and database errors are caught and returned gracefully
 */
export async function createStorageItem(
    data: z.infer<typeof CreateStorageItemSchema>
): Promise<{ success: boolean; error?: string }> {
    try {
        // Zod parses and validates the data, throws if invalid
        const validData = CreateStorageItemSchema.parse(data);

        await db.storageItem.create({
            data: validData,
        });

        // Revalidate Next.js cache for storage page to show new item immediately
        revalidatePath("/dashboard/storage");
        return { success: true };
    } catch (error) {
        console.error("Failed to create storage item:", error);
        return { success: false, error: "Failed to create item" };
    }
}

/**
 * Updates an existing storage item
 *
 * @param id - Unique identifier of the storage item to update
 * @param data - Updated fields validated against UpdateStorageItemSchema
 * @returns Success status and optional error message
 *
 * Note: Only provided fields are updated (partial update supported)
 */
export async function updateStorageItem(
    id: string,
    data: z.infer<typeof UpdateStorageItemSchema>
): Promise<{ success: boolean; error?: string }> {
    try {
        const validData = UpdateStorageItemSchema.parse(data);

        await db.storageItem.update({
            where: { id },
            data: validData,
        });

        revalidatePath("/dashboard/storage");
        return { success: true };
    } catch (error) {
        console.error("Failed to update storage item:", error);
        return { success: false, error: "Failed to update item" };
    }
}

/**
 * Deletes a storage item
 *
 * @param id - Unique identifier of the storage item to delete
 * @returns Success status and optional error message
 *
 * Warning: This is a hard delete with no recovery option
 * Consider adding soft delete functionality in the future if needed
 */
export async function deleteStorageItem(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await db.storageItem.delete({
            where: { id },
        });

        revalidatePath("/dashboard/storage");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete storage item:", error);
        return { success: false, error: "Failed to delete item" };
    }
}

/**
 * Retrieves items expiring within a specified threshold
 *
 * @param daysThreshold - Number of days to look ahead (default: 30)
 * @returns Array of storage items expiring within threshold, sorted by expiration date
 *
 * Usage:
 * - getExpiringItems() // Items expiring in next 30 days
 * - getExpiringItems(7) // Items expiring this week
 * - getExpiringItems(90) // Items expiring in next 3 months
 *
 * This function powers:
 * - Dashboard "Expiring Soon" widget
 * - Email/notification alerts
 * - Rotation planning reports
 *
 * Note: Items with no expiration date are excluded from results
 */
export async function getExpiringItems(daysThreshold: number = 30): Promise<StorageItem[]> {
    // Calculate the threshold date (today + daysThreshold)
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return db.storageItem.findMany({
        where: {
            expirationDate: {
                lte: thresholdDate, // Less than or equal to threshold date
            },
        },
        orderBy: {
            expirationDate: "asc", // Soonest expiring first (FIFO rotation priority)
        },
    });
}
