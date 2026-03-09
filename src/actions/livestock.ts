"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CreateAnimalSchema, CreateHealthRecordSchema, CreateProductionLogSchema } from "@/lib/validations";
import { z } from "zod";

export interface Animal {
    id: string;
    name: string;
    type: string;
    breed: string | null;
    birthDate: Date | null;
    sex: string;
    isNeutered: boolean;
    status: string; // active, sold, deceased
    notes: string | null;
}

export async function getAnimals(filters?: { type?: string; status?: string }) {
    const where: any = {};
    if (filters?.type && filters.type !== "all") where.type = filters.type;
    if (filters?.status && filters.status !== "all") where.status = filters.status;

    return db.animal.findMany({
        where,
        orderBy: { name: "asc" },
    });
}

export async function getAnimalById(id: string) {
    return db.animal.findUnique({
        where: { id },
        include: {
            healthRecords: { orderBy: { date: "desc" } },
            productionLogs: { orderBy: { date: "desc" }, take: 20 },
            offspring: true,
            parent: true,
        },
    });
}

export async function createAnimal(data: z.infer<typeof CreateAnimalSchema>) {
    try {
        const validData = CreateAnimalSchema.parse(data);
        await db.animal.create({ data: validData });
        revalidatePath("/dashboard/livestock");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to create animal" };
    }
}

export async function addHealthRecord(animalId: string, data: z.infer<typeof CreateHealthRecordSchema>) {
    try {
        const validData = CreateHealthRecordSchema.parse(data);
        await db.healthRecord.create({
            data: { ...validData, animalId },
        });
        revalidatePath(`/dashboard/livestock/${animalId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to add health record" };
    }
}

export async function logProduction(animalId: string, data: z.infer<typeof CreateProductionLogSchema>) {
    try {
        const validData = CreateProductionLogSchema.parse(data);
        await db.productionLog.create({
            data: { ...validData, animalId },
        });
        revalidatePath(`/dashboard/livestock/${animalId}`);
        // Also revalidate main list for aggregated stats
        revalidatePath("/dashboard/livestock");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to log production" };
    }
}

export async function getProductionStats() {
    // Simple aggregation - would be better done via groupBy in real usage
    const logs = await db.productionLog.findMany({
        where: {
            date: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } // Last 30 days
        }
    });

    const summary: Record<string, number> = {};
    logs.forEach(log => {
        const key = log.type + " (" + log.unit + ")";
        summary[key] = (summary[key] || 0) + log.quantity;
    });

    return summary;
}

/**
 * Get production data formatted for charts
 * Returns daily aggregation for the specified period
 */
export async function getProductionChartData(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await db.productionLog.findMany({
        where: {
            date: { gte: startDate },
        },
        orderBy: { date: "asc" },
    });

    // Aggregate by date and type
    const dailyData = new Map<string, Record<string, number>>();
    
    // Initialize all dates in range
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        dailyData.set(dateStr, {});
    }

    // Aggregate logs by date
    logs.forEach(log => {
        const dateStr = log.date.toISOString().split("T")[0];
        if (!dailyData.has(dateStr)) {
            dailyData.set(dateStr, {});
        }
        const dayData = dailyData.get(dateStr)!;
        const key = log.type;
        dayData[key] = (dayData[key] || 0) + log.quantity;
    });

    // Convert to array format for Recharts
    return Array.from(dailyData.entries())
        .map(([date, data]) => ({
            date,
            ...data,
        }))
        .reverse();
}

/**
 * Get production summary by animal type
 */
export async function getProductionByType() {
    const logs = await db.productionLog.findMany({
        where: {
            date: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) },
        },
        include: {
            animal: {
                select: { type: true },
            },
        },
    });

    const summary: Record<string, { total: number; unit: string }> = {};
    
    logs.forEach(log => {
        const key = `${log.animal.type}-${log.type}`;
        if (!summary[key]) {
            summary[key] = { total: 0, unit: log.unit };
        }
        summary[key].total += log.quantity;
    });

    return Object.entries(summary).map(([key, value]) => ({
        name: key.replace("-", " - "),
        value: value.total,
        unit: value.unit,
    }));
}

export async function getHealthReminders(days: number = 30) {
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + days);

    const records = await db.healthRecord.findMany({
        where: {
            nextDue: {
                gte: today,
                lte: future
            }
        },
        include: {
            animal: true
        },
        orderBy: {
            nextDue: 'asc'
        }
    });

    return records.map(record => ({
        id: record.id,
        title: `Health Reminder: ${record.animal.name}`,
        description: `${record.type} due on ${record.nextDue ? record.nextDue.toLocaleDateString() : 'soon'}`,
        type: record.type,
        date: record.nextDue,
        animalId: record.animalId
    }));
}
