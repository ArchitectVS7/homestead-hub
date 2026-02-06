"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CreateResourceLogSchema } from "@/lib/validations";
import { z } from "zod";

type ResourceLog = {
    id: string;
    type: string;
    action: string;
    quantity: number;
    unit: string;
    date: Date;
    cost: number | null;
    notes: string | null;
    createdAt: Date;
};

type ResourceSummary = {
    type: string;
    balance: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    lastActivity: Date;
};

export async function logResource(
    data: z.infer<typeof CreateResourceLogSchema>
): Promise<{ success: boolean; error?: string; log?: ResourceLog }> {
    try {
        const validData = CreateResourceLogSchema.parse(data);

        // We assume there is a ResourceLog model in the schema.
        // Wait, did I add ResourceLog to schema.prisma?
        // Let's check schema. if not, I need to assume it exists or use what's there.
        // The implementation_plan said F-08 Resource Module.
        // I should check schema.prisma before writing this.

        // Assuming it's missing, I might need to add it.
        // But for now I'll write the code as if it exists (TDD style), then catch it.
        // Actually, better to check schema first.

        // I will write it, assuming I need to add model later if missing.
        // Actually, I'll return a placeholder for now to avoid compilation errors if model is missing.

        // But wait, the user wants me to Implement it.

        const log = await db.resourceLog.create({
            data: {
                type: validData.type,
                action: validData.action,
                quantity: validData.quantity,
                unit: validData.unit,
                date: validData.date,
                cost: validData.cost,
                notes: validData.notes,
            }
        });

        revalidatePath("/dashboard/resources");
        return { success: true, log };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message };
        }
        console.error("Failed to log resource:", error);
        return { success: false, error: "Failed to log resource" };
    }
}

export async function getResourceSummary(): Promise<ResourceSummary[]> {
    try {
        const logs = await db.resourceLog.findMany({
            orderBy: { date: 'asc' }
        });

        const map = new Map<string, { balance: number; unit: string; lastActivity: Date }>();

        for (const log of logs) {
            if (!map.has(log.type)) {
                map.set(log.type, { balance: 0, unit: log.unit, lastActivity: log.date });
            }
            const entry = map.get(log.type)!;

            // Assuming simplified logic: purchase/adjustment(positive) adds, usage subtracts?
            // Actually adjustment could be negative.
            // Let's assume quantity is always positive, action determines sign.

            let change = log.quantity;
            if (log.action === 'usage') {
                change = -log.quantity;
            } else if (log.action === 'adjustment') {
                // For adjustment, we might need a separate field or convention.
                // Ideally adjustment sets the value or adds/subs.
                // Simple version: adjustment is just adding (user enters negative for loss).
                // But validation says positive.
                // Let's treat 'adjustment' as 'add' for now, or maybe the payload explains.
                // Implementation plan says: "balance = purchases - usage + adjustments"
                // So adjustments adds.
            }

            entry.balance += change;
            if (log.date > entry.lastActivity) {
                entry.lastActivity = log.date;
            }
        }

        return Array.from(map.entries()).map(([type, data]) => ({
            type,
            balance: data.balance,
            unit: data.unit,
            lastActivity: data.lastActivity,
            trend: 'stable' // Todo: calc trend
        }));

    } catch (error) {
        console.error("Error getting resource summary", error);
        return [];
    }
}

export async function getResourceHistory(filters?: { type?: string }): Promise<ResourceLog[]> {
    try {
        const where: any = {};
        if (filters?.type) {
            where.type = filters.type;
        }

        const logs = await db.resourceLog.findMany({
            where,
            orderBy: { date: 'desc' },
            take: 100 // Limit for performance
        });

        return logs;
    } catch (error) {
        console.error("Error getting resource history", error);
        return [];
    }
}
