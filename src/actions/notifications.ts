"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getExpiringItems } from "@/actions/storage";
import { getServiceDueEquipment } from "@/actions/equipment";
// import { getFrostAlerts } from "@/actions/weather"; // Need to check if implemented
import { getHealthReminders } from "@/actions/livestock";
// import { getOverdueTasks } from "@/actions/tasks"; // Need to check implementation

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

export async function generateNotifications(): Promise<void> {
    console.log("Generating notifications...");
    try {
        // 1. Storage: Expiring Items
        const expiringItems = await getExpiringItems(7); // < 7 days
        for (const item of expiringItems) {
            await createNotificationIfNotExists({
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
            await createNotificationIfNotExists({
                type: 'alert',
                title: 'Equipment Service Due',
                description: `${eq.name} needs service.`,
                source: 'equipment',
                sourceId: eq.id
            });
        }

        // 3. Livestock: Health Reminders
        const healthReminders = await getHealthReminders();
        for (const record of healthReminders) {
            await createNotificationIfNotExists({
                type: 'info',
                title: 'Health Reminder',
                description: `Upcoming ${record.type} for animal.`, // Ideally fetched animal name if included
                source: 'livestock',
                sourceId: record.id // or record.animalId
            });
        }

    } catch (error) {
        console.error("Error generating notifications:", error);
    }
}

async function createNotificationIfNotExists(data: {
    type: string;
    title: string;
    description: string;
    source: string;
    sourceId: string;
}) {
    // Basic deduplication: look for unread notifications for same sourceId
    const existing = await db.notification.findFirst({
        where: {
            sourceId: data.sourceId,
            source: data.source,
            isRead: false
        }
    });

    if (!existing) {
        await db.notification.create({
            data: {
                ...data,
                isRead: false
            }
        });
    }
}
