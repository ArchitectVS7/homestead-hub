"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CreateCropSchema, CreatePlantingSchema, UpdatePlantingSchema } from "@/lib/validations";
import { z } from "zod";

// --- CROPS ---

export async function getCrops() {
    return db.crop.findMany({
        orderBy: { name: "asc" },
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

export async function deleteCrop(id: string) {
    try {
        await db.crop.delete({ where: { id } });
        revalidatePath("/dashboard/garden");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete crop" };
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

export async function createPlanting(data: z.infer<typeof CreatePlantingSchema>) {
    try {
        const validData = CreatePlantingSchema.parse(data);

        // Calculate expected harvest if not provided but crop has daysToMaturity
        // This logic could be here, but for now we rely on user or client to providing it 
        // or let it be null. Ideally we fetch crop and calc.
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
