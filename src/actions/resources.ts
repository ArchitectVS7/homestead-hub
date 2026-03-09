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

        const map = new Map<string, { balance: number; unit: string; lastActivity: Date; history: { date: Date; balance: number }[] }>();

        for (const log of logs) {
            if (!map.has(log.type)) {
                map.set(log.type, { balance: 0, unit: log.unit, lastActivity: log.date, history: [] });
            }
            const entry = map.get(log.type)!;

            let change = log.quantity;
            if (log.action === 'usage') {
                change = -log.quantity;
            }

            entry.balance += change;
            if (log.date > entry.lastActivity) {
                entry.lastActivity = log.date;
            }
            entry.history.push({ date: log.date, balance: entry.balance });
        }

        // Calculate trend based on recent activity
        return Array.from(map.entries()).map(([type, data]) => {
            const history = data.history;
            let trend: 'up' | 'down' | 'stable' = 'stable';
            
            if (history.length >= 2) {
                // Compare last 7 days vs previous 7 days
                const now = new Date();
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
                
                const recentBalance = history.filter(h => h.date >= weekAgo).pop()?.balance || data.balance;
                const previousBalance = history.filter(h => h.date >= twoWeeksAgo && h.date < weekAgo).pop()?.balance || recentBalance;
                
                if (recentBalance > previousBalance) trend = 'up';
                else if (recentBalance < previousBalance) trend = 'down';
            }

            return {
                type,
                balance: data.balance,
                unit: data.unit,
                trend,
                lastActivity: data.lastActivity,
            };
        });

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
            take: 100
        });

        return logs;
    } catch (error) {
        console.error("Error getting resource history", error);
        return [];
    }
}

/**
 * Get consumption trend data for charts
 */
export async function getResourceChartData(days: number = 30): Promise<Record<string, { date: string; balance: number }[]>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await db.resourceLog.findMany({
        where: {
            date: { gte: startDate },
        },
        orderBy: { date: 'asc' },
    });

    // Group by type and calculate running balance
    const byType = new Map<string, { date: string; balance: number }[]>();
    const balances = new Map<string, number>();

    for (const log of logs) {
        if (!byType.has(log.type)) {
            byType.set(log.type, []);
            balances.set(log.type, 0);
        }

        let change = log.quantity;
        if (log.action === 'usage') {
            change = -log.quantity;
        }

        const currentBalance = balances.get(log.type)! + change;
        balances.set(log.type, currentBalance);

        byType.get(log.type)!.push({
            date: log.date.toISOString().split('T')[0],
            balance: currentBalance,
        });
    }

    return Object.fromEntries(byType);
}

/**
 * Get low stock alerts based on thresholds from Settings
 */
export async function getLowStockAlerts() {
    const settings = await db.settings.findFirst();
    const summaries = await getResourceSummary();

    // Default thresholds (could be customized per resource type in future)
    const defaultThresholds: Record<string, number> = {
        'water': 100,
        'fuel': 50,
        'feed': 100,
        'seeds': 20,
    };

    const alerts = summaries.filter(item => {
        const threshold = defaultThresholds[item.type.toLowerCase()] || 0;
        return threshold > 0 && item.balance < threshold;
    });

    return alerts.map(item => ({
        type: item.type,
        balance: item.balance,
        unit: item.unit,
        threshold: defaultThresholds[item.type.toLowerCase()] || 0,
        percentRemaining: Math.round((item.balance / defaultThresholds[item.type.toLowerCase()]) * 100) || 0,
    }));
}
