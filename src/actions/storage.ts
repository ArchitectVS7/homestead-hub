"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CreateStorageItemSchema, UpdateStorageItemSchema } from "@/lib/validations";
import { z } from "zod";

export interface StorageItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    location: string | null;
    purchaseDate: Date | null;
    expirationDate: Date | null;
    calories: number | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function getStorageItems(filters?: {
    category?: string;
    search?: string;
}): Promise<StorageItem[]> {
    const where: any = {};

    if (filters?.category && filters.category !== "all") {
        where.category = filters.category;
    }

    if (filters?.search) {
        where.name = {
            contains: filters.search,
            mode: "insensitive",
        };
    }

    const items = await db.storageItem.findMany({
        where,
        orderBy: [
            { expirationDate: "asc" }, // Show expiring soonest first by default
            { name: "asc" },
        ],
    });

    return items;
}

export async function createStorageItem(
    data: z.infer<typeof CreateStorageItemSchema>
): Promise<{ success: boolean; error?: string }> {
    try {
        const validData = CreateStorageItemSchema.parse(data);

        await db.storageItem.create({
            data: validData,
        });

        revalidatePath("/dashboard/storage");
        return { success: true };
    } catch (error) {
        console.error("Failed to create storage item:", error);
        return { success: false, error: "Failed to create item" };
    }
}

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

export async function getExpiringItems(daysThreshold: number = 30): Promise<StorageItem[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return db.storageItem.findMany({
        where: {
            expirationDate: {
                lte: thresholdDate,
            },
        },
        orderBy: {
            expirationDate: "asc",
        },
    });
}
