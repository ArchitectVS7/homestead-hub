"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CreateEquipmentSchema, UpdateEquipmentSchema, CreateMaintenanceSchema } from "@/lib/validations";
import { z } from "zod";

export interface EquipmentWithMaintenance {
    id: string;
    name: string;
    category: string;
    model: string | null;
    serialNumber: string | null;
    purchaseDate: Date | null;
    serviceIntervalHours: number | null;
    serviceIntervalDays: number | null;
    lastServiceDate: Date | null;
    lastServiceHours: number | null;
    currentHours: number | null;
    status: string; // operational, needs-service, out-of-order
    notes: string | null;
    maintenance?: MaintenanceRecord[];
}

export interface MaintenanceRecord {
    id: string;
    date: Date;
    type: string;
    description: string;
    cost: number | null;
    hoursAtService: number | null;
}

export async function getEquipment(filters?: { status?: string }) {
    const where: any = {};
    if (filters?.status && filters.status !== "all") {
        where.status = filters.status;
    }

    const equipment = await db.equipment.findMany({
        where,
        orderBy: { name: "asc" },
    });

    return equipment as unknown as EquipmentWithMaintenance[];
}

export async function getEquipmentWithHistory(id: string) {
    return db.equipment.findUnique({
        where: { id },
        include: {
            maintenanceRecords: {
                orderBy: { date: "desc" },
            },
        },
    });
}

function isServiceDue(eq: any): boolean {
    if (eq.status === "out-of-order") return false; // Needs repair, not routine service

    // Check Days Interval
    if (eq.serviceIntervalDays && eq.lastServiceDate) {
        const daysSince = Math.floor((new Date().getTime() - new Date(eq.lastServiceDate).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince >= eq.serviceIntervalDays) return true;
    }

    // Check Hours Interval
    if (eq.serviceIntervalHours && eq.currentHours !== null && eq.lastServiceHours !== null) {
        if ((eq.currentHours - eq.lastServiceHours) >= eq.serviceIntervalHours) return true;
    }

    return false;
}

export async function getServiceDueEquipment() {
    const allEquipment = await db.equipment.findMany({
        where: {
            status: { not: "out-of-order" }
        }
    });

    return allEquipment.filter(isServiceDue);
}

export async function createEquipment(data: z.infer<typeof CreateEquipmentSchema>) {
    try {
        const validData = CreateEquipmentSchema.parse(data);

        await db.equipment.create({
            data: validData,
        });

        revalidatePath("/dashboard/equipment");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to create equipment" };
    }
}

export async function updateEquipment(id: string, data: z.infer<typeof UpdateEquipmentSchema>) {
    try {
        const validData = UpdateEquipmentSchema.parse(data);

        await db.equipment.update({
            where: { id },
            data: validData,
        });

        revalidatePath("/dashboard/equipment");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to update equipment" };
    }
}

export async function logMaintenance(equipmentId: string, data: z.infer<typeof CreateMaintenanceSchema>) {
    try {
        const validData = CreateMaintenanceSchema.parse(data);

        const equipment = await db.equipment.findUnique({ where: { id: equipmentId } });
        if (!equipment) throw new Error("Equipment not found");

        // 1. Create record
        await db.maintenanceRecord.create({
            data: {
                ...validData,
                equipmentId,
            },
        });

        // 2. Update equipment stats
        const updateData: any = {
            lastServiceDate: validData.date,
        };

        // If routine maintenance, reset service status to operational if it was "needs-service"
        if (validData.type === "routine" && equipment.status === "needs-service") {
            updateData.status = "operational";
        }

        // Update hours markers if provided in log
        if (validData.hoursAtService) {
            updateData.lastServiceHours = validData.hoursAtService;
            // Also ensure current hours is at least this high
            if ((equipment.currentHours || 0) < validData.hoursAtService) {
                updateData.currentHours = validData.hoursAtService;
            }
        }

        await db.equipment.update({
            where: { id: equipmentId },
            data: updateData,
        });

        revalidatePath("/dashboard/equipment");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to log maintenance" };
    }
}

export async function deleteEquipment(id: string) {
    try {
        await db.equipment.delete({ where: { id } });
        revalidatePath("/dashboard/equipment");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete equipment" };
    }
}
