"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CreateChecklistSchema, UpdateChecklistSchema, CreateChecklistItemSchema } from "@/lib/validations";
import { z } from "zod";

type Checklist = {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    items: ChecklistItem[];
    isTemplate: boolean;
};

type ChecklistItem = {
    id: string;
    title: string;
    isCompleted: boolean;
};

export async function getChecklists(category?: string): Promise<Checklist[]> {
    try {
        const where: any = {};
        if (category) {
            where.category = category;
        }

        return await db.checklist.findMany({
            where,
            include: {
                items: {
                    orderBy: { sortOrder: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Error fetching checklists:", error);
        return [];
    }
}

export async function createChecklist(
    data: z.infer<typeof CreateChecklistSchema>
): Promise<{ success: boolean; error?: string; checklist?: any }> {
    try {
        const validData = CreateChecklistSchema.parse(data);
        const checklist = await db.checklist.create({
            data: {
                name: validData.name,
                description: validData.description,
                category: validData.category,
                isTemplate: validData.isTemplate || false,
                notes: validData.notes
            }
        });

        revalidatePath("/dashboard/preparedness");
        return { success: true, checklist };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message };
        }
        return { success: false, error: "Failed to create checklist" };
    }
}

export async function createChecklistItem(
    data: z.infer<typeof CreateChecklistItemSchema>
): Promise<{ success: boolean; error?: string }> {
    try {
        const validData = CreateChecklistItemSchema.parse(data);
        await db.checklistItem.create({
            data: {
                checklistId: validData.checklistId,
                title: validData.title,
                description: validData.description,
                notes: validData.notes
            }
        });
        revalidatePath("/dashboard/preparedness");
        return { success: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message };
        }
        return { success: false, error: "Failed to add item" };
    }
}

export async function toggleItem(
    itemId: string,
    isCompleted: boolean
): Promise<{ success: boolean }> {
    try {
        // Check if the checklist is a template
        const item = await db.checklistItem.findUnique({
            where: { id: itemId },
            include: { checklist: true },
        });

        if (item?.checklist.isTemplate) {
            return { success: false }; // Cannot complete items in templates
        }

        await db.checklistItem.update({
            where: { id: itemId },
            data: { isCompleted, completedAt: isCompleted ? new Date() : null }
        });
        revalidatePath("/dashboard/preparedness");
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

/**
 * Clone a template checklist to create a new working checklist
 */
export async function cloneChecklist(templateId: string, newName?: string): Promise<{ success: boolean; error?: string }> {
    try {
        const template = await db.checklist.findUnique({
            where: { id: templateId },
            include: { items: true },
        });

        if (!template || !template.isTemplate) {
            return { success: false, error: "Not a template" };
        }

        // Create new checklist from template
        const newChecklist = await db.checklist.create({
            data: {
                name: newName || `${template.name} (Copy)`,
                description: template.description,
                category: template.category,
                isTemplate: false,
                notes: template.notes,
            },
        });

        // Clone all items
        await Promise.all(
            template.items.map(item =>
                db.checklistItem.create({
                    data: {
                        checklistId: newChecklist.id,
                        title: item.title,
                        description: item.description,
                        sortOrder: item.sortOrder,
                        notes: item.notes,
                        isCompleted: false,
                    },
                })
            )
        );

        revalidatePath("/dashboard/preparedness");
        return { success: true };
    } catch (error) {
        console.error("Failed to clone checklist:", error);
        return { success: false, error: "Failed to clone checklist" };
    }
}

/**
 * Reorder checklist items
 */
export async function reorderChecklistItems(
    checklistId: string,
    itemIds: string[]
): Promise<{ success: boolean; error?: string }> {
    try {
        // Update sortOrder for each item based on new order
        await Promise.all(
            itemIds.map((id, index) =>
                db.checklistItem.update({
                    where: { id },
                    data: { sortOrder: index },
                })
            )
        );

        revalidatePath("/dashboard/preparedness");
        return { success: true };
    } catch (error) {
        console.error("Failed to reorder items:", error);
        return { success: false, error: "Failed to reorder items" };
    }
}

export async function getReadinessScore(): Promise<number> {
    try {
        // Readiness = (Completed Items / Total Items) * 100, excluding templates maybe?
        // Implementation plan says "across all non-template checklists"

        const items = await db.checklistItem.findMany({
            where: {
                checklist: {
                    isTemplate: false
                }
            }
        });

        if (items.length === 0) return 0;

        const completed = items.filter(i => i.isCompleted).length;
        return Math.round((completed / items.length) * 100);
    } catch (error) {
        return 0;
    }
}
