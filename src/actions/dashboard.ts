"use server";

import { db } from "@/lib/db";
import { getExpiringItems } from "./storage";
import { getServiceDueEquipment } from "./equipment";
import { getTaskSections } from "./tasks";
import { getFrostAlert } from "./weather";

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
    const [
        expiringItems,
        serviceDue,
        taskSections,
        frostAlert,
    ] = await Promise.all([
        getExpiringItems(30),
        getServiceDueEquipment(),
        getTaskSections(),
        getFrostAlert(),
    ]);

    return {
        expiringSoonCount: expiringItems.length,
        tasksDueToday: taskSections.dueToday.length,
        tasksOverdue: taskSections.overdue.length,
        equipmentServiceDue: serviceDue.length,
        frostAlert: frostAlert?.isFrost || false,
    };
}

/**
 * Get recent activity from all modules
 */
export async function getRecentActivity(limit: number = 10) {
    const [
        taskCompletions,
        maintenanceRecords,
        productionLogs,
        resourceLogs,
        healthRecords,
    ] = await Promise.all([
        db.taskCompletion.findMany({
            take: limit,
            orderBy: { completedAt: 'desc' },
            include: { task: { select: { title: true } } },
        }),
        db.maintenanceRecord.findMany({
            take: limit,
            orderBy: { date: 'desc' },
            include: { equipment: { select: { name: true } } },
        }),
        db.productionLog.findMany({
            take: limit,
            orderBy: { date: 'desc' },
            include: { animal: { select: { name: true, type: true } } },
        }),
        db.resourceLog.findMany({
            take: limit,
            orderBy: { date: 'desc' },
        }),
        db.healthRecord.findMany({
            take: limit,
            orderBy: { date: 'desc' },
            include: { animal: { select: { name: true, type: true } } },
        }),
    ]);

    // Combine and sort all activities
    const activities = [
        ...taskCompletions.map(c => ({
            type: 'task' as const,
            title: `Completed task: ${c.task.title}`,
            date: c.completedAt,
            sourceId: c.id,
        })),
        ...maintenanceRecords.map(r => ({
            type: 'maintenance' as const,
            title: `Serviced ${r.equipment.name}: ${r.description}`,
            date: r.date,
            sourceId: r.id,
        })),
        ...productionLogs.map(l => ({
            type: 'production' as const,
            title: `Logged ${l.quantity} ${l.unit} of ${l.type} from ${l.animal.name || l.animal.type}`,
            date: l.date,
            sourceId: l.id,
        })),
        ...resourceLogs.map(l => ({
            type: 'resource' as const,
            title: `${l.action} ${l.quantity} ${l.unit} of ${l.type}`,
            date: l.date,
            sourceId: l.id,
        })),
        ...healthRecords.map(r => ({
            type: 'health' as const,
            title: `${r.type} for ${r.animal.name || r.animal.type}: ${r.description}`,
            date: r.date,
            sourceId: r.id,
        })),
    ];

    // Sort by date descending and take limit
    return activities
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, limit);
}

/**
 * Get alerts from all modules
 */
export async function getDashboardAlerts() {
    const [
        expiringItems,
        serviceDue,
        taskSections,
        frostAlert,
    ] = await Promise.all([
        getExpiringItems(7),
        getServiceDueEquipment(),
        getTaskSections(),
        getFrostAlert(),
    ]);

    const alerts = [];

    // Storage alerts
    if (expiringItems.length > 0) {
        alerts.push({
            type: 'warning' as const,
            title: 'Items Expiring Soon',
            description: `${expiringItems.length} item(s) expiring within 7 days`,
            count: expiringItems.length,
            link: '/dashboard/storage',
        });
    }

    // Equipment alerts
    if (serviceDue.length > 0) {
        alerts.push({
            type: 'alert' as const,
            title: 'Equipment Service Due',
            description: `${serviceDue.length} equipment item(s) need service`,
            count: serviceDue.length,
            link: '/dashboard/equipment',
        });
    }

    // Task alerts
    if (taskSections.overdue.length > 0) {
        alerts.push({
            type: 'alert' as const,
            title: 'Overdue Tasks',
            description: `${taskSections.overdue.length} task(s) overdue`,
            count: taskSections.overdue.length,
            link: '/dashboard/tasks',
        });
    }

    // Weather alerts
    if (frostAlert?.isFrost) {
        alerts.push({
            type: 'warning' as const,
            title: 'Frost Alert',
            description: `Temperature dropped to ${frostAlert.temperature}°F`,
            count: 1,
            link: '/dashboard/weather',
        });
    }

    return alerts;
}
