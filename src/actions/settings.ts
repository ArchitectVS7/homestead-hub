"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { UpdateSettingsSchema } from "@/lib/validations";
import { z } from "zod";

export async function getSettings() {
    let settings = await db.settings.findFirst();

    if (!settings) {
        // Should have been created during setup, but ensure it exists
        settings = await db.settings.create({
            data: {},
        });
    }

    return settings;
}

export async function updateSettings(
    data: z.infer<typeof UpdateSettingsSchema>
): Promise<{ success: boolean; error?: string }> {
    try {
        const validData = UpdateSettingsSchema.parse(data);
        const settings = await getSettings();

        await db.settings.update({
            where: { id: settings.id },
            data: validData,
        });

        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message };
        }
        console.error("Failed to update settings:", error);
        return { success: false, error: "Failed to update settings" };
    }
}

/**
 * Export all application data as JSON
 */
export async function exportAllData(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const [
            storageItems,
            crops,
            plantings,
            equipment,
            maintenanceRecords,
            animals,
            healthRecords,
            productionLogs,
            tasks,
            taskCompletions,
            resourceLogs,
            weatherSnapshots,
            checklists,
            checklistItems,
            notifications,
            settings,
        ] = await Promise.all([
            db.storageItem.findMany(),
            db.crop.findMany(),
            db.planting.findMany(),
            db.equipment.findMany(),
            db.maintenanceRecord.findMany(),
            db.animal.findMany(),
            db.healthRecord.findMany(),
            db.productionLog.findMany(),
            db.task.findMany(),
            db.taskCompletion.findMany(),
            db.resourceLog.findMany(),
            db.weatherSnapshot.findMany(),
            db.checklist.findMany(),
            db.checklistItem.findMany(),
            db.notification.findMany(),
            db.settings.findFirst(),
        ]);

        const exportData = {
            version: "1.0",
            exportedAt: new Date().toISOString(),
            data: {
                storageItems,
                crops,
                plantings,
                equipment,
                maintenanceRecords,
                animals,
                healthRecords,
                productionLogs,
                tasks,
                taskCompletions,
                resourceLogs,
                weatherSnapshots,
                checklists,
                checklistItems,
                notifications,
                settings,
            },
        };

        return { success: true, data: exportData };
    } catch (error) {
        console.error("Failed to export data:", error);
        return { success: false, error: "Failed to export data" };
    }
}

/**
 * Import data from JSON backup
 */
export async function importData(jsonData: any): Promise<{ success: boolean; error?: string }> {
    try {
        const data = jsonData.data;
        if (!data) {
            return { success: false, error: "Invalid import format" };
        }

        // Clear existing data (optional - could also merge)
        await Promise.all([
            db.notification.deleteMany({}),
            db.checklistItem.deleteMany({}),
            db.checklist.deleteMany({}),
            db.weatherSnapshot.deleteMany({}),
            db.resourceLog.deleteMany({}),
            db.taskCompletion.deleteMany({}),
            db.task.deleteMany({}),
            db.productionLog.deleteMany({}),
            db.healthRecord.deleteMany({}),
            db.animal.deleteMany({}),
            db.maintenanceRecord.deleteMany({}),
            db.equipment.deleteMany({}),
            db.planting.deleteMany({}),
            db.crop.deleteMany({}),
            db.storageItem.deleteMany({}),
        ]);

        // Import data
        await Promise.all([
            data.storageItems?.length && db.storageItem.createMany({ data: data.storageItems }),
            data.crops?.length && db.crop.createMany({ data: data.crops }),
            data.plantings?.length && db.planting.createMany({ data: data.plantings }),
            data.equipment?.length && db.equipment.createMany({ data: data.equipment }),
            data.maintenanceRecords?.length && db.maintenanceRecord.createMany({ data: data.maintenanceRecords }),
            data.animals?.length && db.animal.createMany({ data: data.animals }),
            data.healthRecords?.length && db.healthRecord.createMany({ data: data.healthRecords }),
            data.productionLogs?.length && db.productionLog.createMany({ data: data.productionLogs }),
            data.tasks?.length && db.task.createMany({ data: data.tasks }),
            data.taskCompletions?.length && db.taskCompletion.createMany({ data: data.taskCompletions }),
            data.resourceLogs?.length && db.resourceLog.createMany({ data: data.resourceLogs }),
            data.weatherSnapshots?.length && db.weatherSnapshot.createMany({ data: data.weatherSnapshots }),
            data.checklists?.length && db.checklist.createMany({ data: data.checklists }),
            data.checklistItems?.length && db.checklistItem.createMany({ data: data.checklistItems }),
            data.notifications?.length && db.notification.createMany({ data: data.notifications }),
        ].filter(Boolean));

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to import data:", error);
        return { success: false, error: "Failed to import data" };
    }
}
