"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getExpiringItems } from "@/actions/storage";
import { getServiceDueEquipment } from "@/actions/equipment";
import { getFrostAlert } from "@/actions/weather";
import { getHealthReminders } from "@/actions/livestock";
import { getTaskSections } from "@/actions/tasks";

type Notification = {
    id: string;
    type: string;
    title: string;
    description: string;
    source: string;
    sourceId: string | null;
    isRead: boolean;
    createdAt: Date;
};

export async function getNotifications(): Promise<Notification[]> {
    try {
        return await db.notification.findMany({
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
}

export async function getUnreadCount(): Promise<number> {
    try {
        return await db.notification.count({
            where: { isRead: false }
        });
    } catch (error) {
        return 0;
    }
}

export async function markAsRead(id: string): Promise<void> {
    try {
        await db.notification.update({
            where: { id },
            data: { isRead: true }
        });
        revalidatePath("/dashboard");
    } catch (error) {
        console.error("Error marking notification as read:", error);
    }
}

export async function markAllAsRead(): Promise<void> {
    try {
        await db.notification.updateMany({
            where: { isRead: false },
            data: { isRead: true }
        });
        revalidatePath("/dashboard");
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
    }
}

export async function deleteNotification(id: string): Promise<void> {
    try {
        await db.notification.delete({
            where: { id }
        });
        revalidatePath("/dashboard");
    } catch (error) {
        console.error("Error deleting notification:", error);
    }
}

/**
 * Generate notifications from all modules
 */
export async function generateNotifications(): Promise<void> {
    console.log("Generating notifications...");
    try {
        const notificationsToCreate: {
            type: string;
            title: string;
            description: string;
            source: string;
            sourceId: string;
        }[] = [];

        // 1. Storage: Expiring Items
        const expiringItems = await getExpiringItems(7); // < 7 days
        for (const item of expiringItems) {
            notificationsToCreate.push({
                type: 'warning',
                title: 'Item Expiring Soon',
                description: `${item.name} is expiring on ${item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'soon'}`,
                source: 'storage',
                sourceId: item.id
            });
        }

        // 2. Equipment: Service Due
        const serviceDue = await getServiceDueEquipment();
        for (const eq of serviceDue) {
            notificationsToCreate.push({
                type: 'alert',
                title: 'Equipment Service Due',
                description: `${eq.name} needs service.`,
                source: 'equipment',
                sourceId: eq.id
            });
        }

        // 3. Tasks: Overdue Tasks
        const taskSections = await getTaskSections();
        for (const task of taskSections.overdue) {
            notificationsToCreate.push({
                type: 'alert',
                title: 'Task Overdue',
                description: `${task.title} is overdue.`,
                source: 'tasks',
                sourceId: task.id
            });
        }

        // 4. Weather: Frost Alerts
        const frostAlert = await getFrostAlert();
        if (frostAlert?.isFrost) {
            notificationsToCreate.push({
                type: 'warning',
                title: 'Frost Alert',
                description: `Temperature dropped to ${frostAlert.temperature}°F. Protect plants and animals.`,
                source: 'weather',
                sourceId: frostAlert.timestamp?.toISOString() || 'frost'
            });
        }

        // 5. Livestock: Health Reminders
        const healthReminders = await getHealthReminders();
        for (const record of healthReminders) {
            notificationsToCreate.push({
                type: 'info',
                title: 'Health Reminder',
                description: `Upcoming ${record.type} for ${record.title.replace('Health Reminder: ', '')}.`,
                source: 'livestock',
                sourceId: record.id
            });
        }

        await createNotificationsIfNotExistsBatch(notificationsToCreate);

    } catch (error) {
        console.error("Error generating notifications:", error);
    }
}

async function createNotificationsIfNotExistsBatch(notifications: {
    type: string;
    title: string;
    description: string;
    source: string;
    sourceId: string;
}[]) {
    if (notifications.length === 0) return;

    // 1. Get all existing unread notifications for the relevant sources and sourceIds
    const existing = await db.notification.findMany({
        where: {
            OR: notifications.map(n => ({
                source: n.source,
                sourceId: n.sourceId,
                isRead: false
            }))
        },
        select: {
            source: true,
            sourceId: true
        }
    });

    const existingKeys = new Set(existing.map(e => `${e.source}:${e.sourceId}`));

    // 2. Filter out notifications that already exist and deduplicate the list to create
    const uniqueToCreateMap = new Map<string, any>();

    for (const n of notifications) {
        const key = `${n.source}:${n.sourceId}`;
        if (!existingKeys.has(key) && !uniqueToCreateMap.has(key)) {
            uniqueToCreateMap.set(key, n);
        }
    }

    const toCreate = Array.from(uniqueToCreateMap.values());

    // 3. Create missing notifications in batch
    if (toCreate.length > 0) {
        await db.notification.createMany({
            data: toCreate.map(n => ({
                ...n,
                isRead: false
            }))
        });
    }
}
