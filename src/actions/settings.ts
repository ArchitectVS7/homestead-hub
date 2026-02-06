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
