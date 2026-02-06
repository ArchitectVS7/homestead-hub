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
