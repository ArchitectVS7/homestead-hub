"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CreateCropSchema, CreatePlantingSchema, UpdateCropSchema, UpdatePlantingSchema } from "@/lib/validations";
import { z } from "zod";

// --- CROPS ---

export async function getCrops() {
    return db.crop.findMany({
        orderBy: { name: "asc" },
    });
}

export async function getCropWithPlantings(id: string) {
    return db.crop.findUnique({
        where: { id },
        include: {
            plantings: {
                orderBy: { plantDate: "desc" },
            },
        },
    });
}

export async function createCrop(data: z.infer<typeof CreateCropSchema>) {
    try {
        const validData = CreateCropSchema.parse(data);

        await db.crop.create({
            data: validData,
        });

        revalidatePath("/dashboard/garden");
        return { success: true };
    } catch (error) {
        console.error("Failed to create crop:", error);
        return { success: false, error: "Failed to create crop" };
    }
}

export async function updateCrop(id: string, data: z.infer<typeof UpdateCropSchema>) {
    try {
        const validData = UpdateCropSchema.parse(data);

        await db.crop.update({
            where: { id },
            data: validData,
        });

        revalidatePath("/dashboard/garden");
        return { success: true };
    } catch (error) {
        console.error("Failed to update crop:", error);
        return { success: false, error: "Failed to update crop" };
    }
}

export async function deleteCrop(id: string) {
    try {
        await db.crop.delete({ where: { id } });
        revalidatePath("/dashboard/garden");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete crop" };
    }
}

/**
 * Check for companion planting conflicts
 * Returns warning if incompatible plants are in the same location
 */
export async function checkCompanionConflict(cropId: string, location: string): Promise<{ hasConflict: boolean; conflictMessage?: string }> {
    try {
        // Get the crop being planted
        const crop = await db.crop.findUnique({ where: { id: cropId } });
        if (!crop || !crop.incompatiblePlants) {
            return { hasConflict: false };
        }

        // Parse incompatible plants JSON
        let incompatiblePlants: string[] = [];
        try {
            incompatiblePlants = JSON.parse(crop.incompatiblePlants);
        } catch {
            return { hasConflict: false };
        }

        if (incompatiblePlants.length === 0) {
            return { hasConflict: false };
        }

        // Find active plantings in the same location
        const existingPlantings = await db.planting.findMany({
            where: {
                location,
                actualHarvest: null, // Only check active plantings
            },
            include: {
                crop: true,
            },
        });

        // Check for conflicts
        for (const planting of existingPlantings) {
            if (incompatiblePlants.some(ip => ip.toLowerCase() === planting.crop.name.toLowerCase())) {
                return {
                    hasConflict: true,
                    conflictMessage: `${planting.crop.name} is incompatible with ${crop.name} in the same location.`,
                };
            }
        }

        return { hasConflict: false };
    } catch (error) {
        console.error("Error checking companion conflict:", error);
        return { hasConflict: false };
    }
}

// --- PLANTINGS ---

export interface PlantingWithCrop {
    id: string;
    cropId: string;
    crop: { name: string; variety: string | null; daysToMaturity: number | null };
    location: string;
    plantDate: Date;
    expectedHarvest: Date | null;
    actualHarvest: Date | null;
    yield: number | null;
    yieldUnit: string | null;
    quantity: number;
    notes: string | null;
}

export async function getPlantings(filters?: { status?: "active" | "harvested" }) {
    const where: any = {};

    if (filters?.status === "active") {
        where.actualHarvest = null;
    } else if (filters?.status === "harvested") {
        where.actualHarvest = { not: null };
    }

    const plantings = await db.planting.findMany({
        where,
        include: {
            crop: {
                select: { name: true, variety: true, daysToMaturity: true },
            },
        },
        orderBy: { plantDate: "desc" },
    });

    return plantings as unknown as PlantingWithCrop[];
}

/**
 * Get plantings for a specific month range for calendar view
 */
export async function getPlantingsForMonth(year: number, month: number) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last day of month

    const plantings = await db.planting.findMany({
        where: {
            OR: [
                {
                    plantDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                {
                    expectedHarvest: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            ],
        },
        include: {
            crop: {
                select: { name: true, variety: true, daysToMaturity: true },
            },
        },
    });

    return plantings as unknown as PlantingWithCrop[];
}

export async function createPlanting(data: z.infer<typeof CreatePlantingSchema>): Promise<{ success: boolean; error?: string; conflictMessage?: string }> {
    try {
        const validData = CreatePlantingSchema.parse(data);

        // Check for companion planting conflicts
        const conflict = await checkCompanionConflict(validData.cropId, validData.location);
        if (conflict.hasConflict) {
            return { success: false, error: "Companion planting conflict", conflictMessage: conflict.conflictMessage };
        }

        // Calculate expected harvest if not provided but crop has daysToMaturity
        let expectedHarvest = validData.expectedHarvest;

        if (!expectedHarvest && validData.cropId) {
            const crop = await db.crop.findUnique({ where: { id: validData.cropId } });
            if (crop && crop.daysToMaturity) {
                expectedHarvest = new Date(validData.plantDate);
                expectedHarvest.setDate(expectedHarvest.getDate() + crop.daysToMaturity);
            }
        }

        await db.planting.create({
            data: {
                ...validData,
                expectedHarvest,
            },
        });

        revalidatePath("/dashboard/garden");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to create planting" };
    }
}

export async function updatePlanting(id: string, data: z.infer<typeof UpdatePlantingSchema>) {
    try {
        const validData = UpdatePlantingSchema.parse(data);

        await db.planting.update({
            where: { id },
            data: validData,
        });

        revalidatePath("/dashboard/garden");
        return { success: true };
    } catch (error) {
        console.error("Failed to update planting:", error);
        return { success: false, error: "Failed to update planting" };
    }
}

export async function logHarvest(id: string, data: { actualHarvest: Date; yieldQuantity: number; yieldUnit: string; notes?: string }) {
    try {
        // Basic validation
        if (!data.actualHarvest || data.yieldQuantity < 0) throw new Error("Invalid harvest data");

        await db.planting.update({
            where: { id },
            data: {
                actualHarvest: data.actualHarvest,
                yield: data.yieldQuantity,
                yieldUnit: data.yieldUnit,
                notes: data.notes, // Append or overwrite? Using overwrite for simplicity per typical CRUD
            },
        });

        revalidatePath("/dashboard/garden");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to log harvest" };
    }
}

export async function deletePlanting(id: string) {
    try {
        await db.planting.delete({ where: { id } });
        revalidatePath("/dashboard/garden");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete planting" };
    }
}
