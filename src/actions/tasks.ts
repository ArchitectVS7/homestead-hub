"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CreateTaskSchema, UpdateTaskSchema, CompleteTaskSchema } from "@/lib/validations";
import { z } from "zod";

export interface TaskWithCompletions {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    priority: string;
    recurrenceRule: string | null;
    nextDue: Date | null;
    lastCompleted: Date | null;
    assignedTo: string | null;
    estimatedMinutes: number | null;
    notes: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    completions?: {
        id: string;
        completedAt: Date;
    }[];
}

export async function getTasks(filters?: {
    status?: "all" | "active" | "completed";
    category?: string;
    priority?: string;
}): Promise<TaskWithCompletions[]> {
    const where: any = {};

    // Status filtering logic
    if (filters?.status === "active") {
        // Active tasks are those that are marked active
        where.isActive = true;
    } else if (filters?.status === "completed") {
        // Completed one-off tasks (isActive=false and no recurrence)
        where.isActive = false;
    }
    // "all" returns everything

    if (filters?.category && filters.category !== "all") {
        where.category = filters.category;
    }

    if (filters?.priority && filters.priority !== "all") {
        where.priority = filters.priority;
    }

    const tasks = await db.task.findMany({
        where,
        include: {
            completions: {
                orderBy: { completedAt: "desc" },
                take: 1,
            },
        },
        orderBy: [
            { priority: "desc" }, // Urgent first
            { nextDue: "asc" },   // Due soonest first
        ],
    });

    return tasks as unknown as TaskWithCompletions[];
}

export async function createTask(
    data: z.infer<typeof CreateTaskSchema>
): Promise<{ success: boolean; error?: string }> {
    try {
        const validData = CreateTaskSchema.parse(data);

        await db.task.create({
            data: {
                ...validData,
                isActive: true,
            },
        });

        revalidatePath("/dashboard/tasks");
        return { success: true };
    } catch (error) {
        console.error("Failed to create task:", error);
        return { success: false, error: "Failed to create task" };
    }
}

export async function updateTask(
    id: string,
    data: z.infer<typeof UpdateTaskSchema>
): Promise<{ success: boolean; error?: string }> {
    try {
        const validData = UpdateTaskSchema.parse(data);

        await db.task.update({
            where: { id },
            data: validData,
        });

        revalidatePath("/dashboard/tasks");
        return { success: true };
    } catch (error) {
        console.error("Failed to update task:", error);
        return { success: false, error: "Failed to update task" };
    }
}

export async function completeTask(
    id: string,
    data: z.infer<typeof CompleteTaskSchema>
): Promise<{ success: boolean; error?: string }> {
    try {
        const validData = CompleteTaskSchema.parse(data);
        const now = new Date();

        const task = await db.task.findUnique({ where: { id } });
        if (!task) return { success: false, error: "Task not found" };

        // 1. Create completion record
        await db.taskCompletion.create({
            data: {
                taskId: id,
                completedAt: now,
                duration: validData.duration,
                notes: validData.notes,
            },
        });

        // 2. Update task status
        if (task.recurrenceRule) {
            // Recurring task: Keep active, update lastCompleted and nextDue
            // Mock recurrence: add 1 day if not parsed
            let nextDueDate = new Date();
            nextDueDate.setDate(nextDueDate.getDate() + 1);

            await db.task.update({
                where: { id },
                data: {
                    lastCompleted: now,
                    nextDue: nextDueDate,
                },
            });
        } else {
            // One-off task: Mark inactive
            await db.task.update({
                where: { id },
                data: {
                    isActive: false,
                    lastCompleted: now,
                    nextDue: null,
                },
            });
        }

        revalidatePath("/dashboard/tasks");
        return { success: true };
    } catch (error) {
        console.error("Failed to complete task:", error);
        return { success: false, error: "Failed to complete task" };
    }
}

export async function deleteTask(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await db.task.delete({
            where: { id },
        });

        revalidatePath("/dashboard/tasks");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete task:", error);
        return { success: false, error: "Failed to delete task" };
    }
}
