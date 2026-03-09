"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CreateTaskSchema, UpdateTaskSchema, CompleteTaskSchema } from "@/lib/validations";
import { z } from "zod";
import { getNextOccurrence, isTaskOverdue, isTaskDueToday, isTaskDueThisWeek } from "@/lib/rrule";

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
            // Use RRULE parser to calculate next occurrence
            const nextDueDate = getNextOccurrence(task.recurrenceRule, now);

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

/**
 * Get tasks organized by sections for the task dashboard
 */
export async function getTaskSections() {
    const allTasks = await db.task.findMany({
        where: {
            isActive: true,
        },
        include: {
            completions: {
                orderBy: { completedAt: "desc" },
                take: 1,
            },
        },
        orderBy: [
            { priority: "desc" },
            { nextDue: "asc" },
        ],
    });

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const overdue: TaskWithCompletions[] = [];
    const dueToday: TaskWithCompletions[] = [];
    const upcomingThisWeek: TaskWithCompletions[] = [];
    const later: TaskWithCompletions[] = [];

    for (const task of allTasks as unknown as TaskWithCompletions[]) {
        if (!task.nextDue) {
            // Tasks without due date go to later
            later.push(task);
            continue;
        }

        const dueDate = new Date(task.nextDue);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate < now) {
            overdue.push(task);
        } else if (
            dueDate.getDate() === now.getDate() &&
            dueDate.getMonth() === now.getMonth() &&
            dueDate.getFullYear() === now.getFullYear()
        ) {
            dueToday.push(task);
        } else {
            // Check if due this week
            const endOfWeek = new Date(now);
            endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
            endOfWeek.setHours(23, 59, 59, 999);

            if (dueDate <= endOfWeek) {
                upcomingThisWeek.push(task);
            } else {
                later.push(task);
            }
        }
    }

    return {
        overdue,
        dueToday,
        upcomingThisWeek,
        later,
        stats: {
            overdueCount: overdue.length,
            dueTodayCount: dueToday.length,
            completedThisWeek: await getCompletedThisWeekCount(),
            upcomingThisWeekCount: upcomingThisWeek.length,
        },
    };
}

/**
 * Get count of tasks completed this week
 */
async function getCompletedThisWeekCount(): Promise<number> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return db.taskCompletion.count({
        where: {
            completedAt: {
                gte: startOfWeek,
            },
        },
    });
}

/**
 * Get full completion history for a task
 */
export async function getTaskCompletionHistory(taskId: string) {
    return db.taskCompletion.findMany({
        where: { taskId },
        orderBy: { completedAt: "desc" },
    });
}

/**
 * Get RRULE description for a task
 */
export async function getTaskRecurrenceDescription(taskId: string): Promise<string | null> {
    const task = await db.task.findUnique({
        where: { id: taskId },
        select: { recurrenceRule: true },
    });

    if (!task || !task.recurrenceRule) return null;

    const { getRRuleDescription } = await import("@/lib/rrule");
    return getRRuleDescription(task.recurrenceRule);
}
