"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CreateWeatherSnapshotSchema } from "@/lib/validations";
import { z } from "zod";

type WeatherSnapshot = {
    id: string;
    timestamp: Date;
    temperature: number;
    humidity: number | null;
    conditions: string | null;
    precipitation: number | null;
    windSpeed: number | null;
    notes: string | null;
};

export async function logWeather(
    data: z.infer<typeof CreateWeatherSnapshotSchema>
): Promise<{ success: boolean; error?: string }> {
    try {
        const validData = CreateWeatherSnapshotSchema.parse(data);

        await db.weatherSnapshot.create({
            data: {
                timestamp: validData.date || new Date(),
                temperature: validData.temperature,
                humidity: validData.humidity,
                conditions: validData.conditions,
                precipitation: validData.precipitation,
                windSpeed: validData.windSpeed,
                notes: validData.notes
            }
        });

        revalidatePath("/dashboard/weather");
        return { success: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message };
        }
        console.error("Failed to log weather:", error);
        return { success: false, error: "Failed to log weather" };
    }
}

export async function getLatestWeather(): Promise<WeatherSnapshot | null> {
    try {
        const latest = await db.weatherSnapshot.findFirst({
            orderBy: { timestamp: 'desc' }
        });
        return latest;
    } catch (error) {
        console.error("Error getting latest weather", error);
        return null; // Return null if fails or no data
    }
}

export async function getWeatherHistory(): Promise<WeatherSnapshot[]> {
    try {
        return await db.weatherSnapshot.findMany({
            orderBy: { timestamp: 'desc' },
            take: 50
        });
    } catch (error) {
        return [];
    }
}

/**
 * Check for frost conditions (temperature <= 32°F)
 */
export async function getFrostAlert(): Promise<{ isFrost: boolean; temperature: number | null; timestamp: Date | null } | null> {
    try {
        const latest = await db.weatherSnapshot.findFirst({
            orderBy: { timestamp: 'desc' },
        });

        if (!latest) return null;

        return {
            isFrost: latest.temperature <= 32,
            temperature: latest.temperature,
            timestamp: latest.timestamp,
        };
    } catch (error) {
        console.error("Error checking frost alert", error);
        return null;
    }
}

/**
 * Get weather data for temperature trend chart
 */
export async function getWeatherChartData(days: number = 30): Promise<{ date: string; temperature: number; precipitation: number | null }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const snapshots = await db.weatherSnapshot.findMany({
        where: {
            timestamp: { gte: startDate },
        },
        orderBy: { timestamp: 'asc' },
    });

    // Group by date and get average temperature per day
    const byDate = new Map<string, { temps: number[]; precipitation: number | null }>();

    for (const snapshot of snapshots) {
        const dateStr = snapshot.timestamp.toISOString().split('T')[0];
        if (!byDate.has(dateStr)) {
            byDate.set(dateStr, { temps: [], precipitation: null });
        }
        const entry = byDate.get(dateStr)!;
        entry.temps.push(snapshot.temperature);
        if (snapshot.precipitation !== null && snapshot.precipitation > 0) {
            entry.precipitation = (entry.precipitation || 0) + snapshot.precipitation;
        }
    }

    return Array.from(byDate.entries()).map(([date, data]) => ({
        date,
        temperature: data.temps.reduce((a, b) => a + b, 0) / data.temps.length,
        precipitation: data.precipitation,
    }));
}

/**
 * Get weather statistics
 */
export async function getWeatherStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const snapshots = await db.weatherSnapshot.findMany({
        where: {
            timestamp: { gte: startDate },
        },
    });

    if (snapshots.length === 0) {
        return {
            avgTemp: null,
            highTemp: null,
            lowTemp: null,
            totalPrecipitation: 0,
            snapshotCount: 0,
        };
    }

    const temps = snapshots.map(s => s.temperature);
    const totalPrecip = snapshots.reduce((sum, s) => sum + (s.precipitation || 0), 0);

    return {
        avgTemp: temps.reduce((a, b) => a + b, 0) / temps.length,
        highTemp: Math.max(...temps),
        lowTemp: Math.min(...temps),
        totalPrecipitation: totalPrecip,
        snapshotCount: snapshots.length,
    };
}
