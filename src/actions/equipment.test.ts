import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";

// Mock the db module with inline mock creation
vi.mock("@/lib/db", () => ({
    db: mockDeep<PrismaClient>(),
}));

// Import after mocking
import * as equipmentActions from "./equipment";
import { db } from "@/lib/db";

// Get reference to the mocked db
const mockDb = db as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

describe("Equipment Actions", () => {
    beforeEach(() => {
        mockReset(mockDb);
    });

    describe("getEquipment", () => {
        it("should return all equipment ordered by name", async () => {
            const mockEquipment = [
                { id: "1", name: "Tractor", category: "tractor", status: "operational" },
                { id: "2", name: "Mower", category: "mower", status: "needs-service" },
            ];

            mockDb.equipment.findMany.mockResolvedValue(mockEquipment as any);

            const result = await equipmentActions.getEquipment();

            expect(result).toEqual(mockEquipment);
            expect(mockDb.equipment.findMany).toHaveBeenCalledWith({
                where: {},
                orderBy: { name: "asc" },
            });
        });

        it("should filter by status", async () => {
            mockDb.equipment.findMany.mockResolvedValue([]);

            await equipmentActions.getEquipment({ status: "operational" });

            expect(mockDb.equipment.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: "operational" },
                })
            );
        });
    });

    describe("getEquipmentWithHistory", () => {
        it("should return equipment with maintenance records", async () => {
            const mockEquipment = {
                id: "1",
                name: "Tractor",
                maintenanceRecords: [
                    { id: "m1", date: new Date(), type: "routine", description: "Oil change" },
                ],
            };

            mockDb.equipment.findUnique.mockResolvedValue(mockEquipment as any);

            const result = await equipmentActions.getEquipmentWithHistory("1");

            expect(result).toEqual(mockEquipment);
            expect(mockDb.equipment.findUnique).toHaveBeenCalledWith({
                where: { id: "1" },
                include: {
                    maintenanceRecords: {
                        orderBy: { date: "desc" },
                    },
                },
            });
        });
    });

    describe("getServiceDueStatus", () => {
        it("should return not due when no service intervals set", async () => {
            mockDb.equipment.findUnique.mockResolvedValue({
                id: "1",
                status: "operational",
                serviceIntervalDays: null,
                serviceIntervalHours: null,
            } as any);

            const result = await equipmentActions.getServiceDueStatus("1");

            expect(result).toEqual({
                isDue: false,
                reason: null,
                daysOverdue: 0,
                hoursOverdue: 0,
            });
        });

        it("should return not due for out-of-order equipment", async () => {
            mockDb.equipment.findUnique.mockResolvedValue({
                id: "1",
                status: "out-of-order",
            } as any);

            const result = await equipmentActions.getServiceDueStatus("1");

            expect(result.isDue).toBe(false);
        });

        it("should return due when days interval exceeded", async () => {
            const lastServiceDate = new Date();
            lastServiceDate.setDate(lastServiceDate.getDate() - 400); // 400 days ago

            mockDb.equipment.findUnique.mockResolvedValue({
                id: "1",
                status: "operational",
                serviceIntervalDays: 365,
                serviceIntervalHours: null,
                lastServiceDate,
                lastServiceHours: null,
                currentHours: null,
            } as any);

            const result = await equipmentActions.getServiceDueStatus("1");

            expect(result.isDue).toBe(true);
            expect(result.reason).toContain("Overdue by");
            expect(result.daysOverdue).toBeGreaterThan(0);
        });

        it("should return due when hours interval exceeded", async () => {
            mockDb.equipment.findUnique.mockResolvedValue({
                id: "1",
                status: "operational",
                serviceIntervalDays: null,
                serviceIntervalHours: 100,
                lastServiceDate: null,
                lastServiceHours: 500,
                currentHours: 650,
            } as any);

            const result = await equipmentActions.getServiceDueStatus("1");

            expect(result.isDue).toBe(true);
            expect(result.hoursOverdue).toBe(50);
        });
    });

    describe("getMaintenanceStats", () => {
        it("should return stats with no records", async () => {
            mockDb.maintenanceRecord.findMany.mockResolvedValue([]);

            const result = await equipmentActions.getMaintenanceStats("1");

            expect(result).toEqual({
                totalRecords: 0,
                totalCost: 0,
                averageCost: 0,
                lastServiceDate: null,
                lastServiceType: null,
            });
        });

        it("should calculate total and average cost", async () => {
            // Records are ordered by date desc, so first one is "latest"
            const records = [
                { id: "3", cost: 50, type: "inspection", date: new Date("2024-12-01") },
                { id: "2", cost: 200, type: "repair", date: new Date("2024-06-01") },
                { id: "1", cost: 100, type: "routine", date: new Date("2024-01-01") },
            ];

            mockDb.maintenanceRecord.findMany.mockResolvedValue(records as any);

            const result = await equipmentActions.getMaintenanceStats("1");

            expect(result.totalRecords).toBe(3);
            expect(result.totalCost).toBe(350);
            expect(result.averageCost).toBeCloseTo(116.67, 2);
            expect(result.lastServiceType).toBe("inspection");
        });
    });

    describe("getServiceDueEquipment", () => {
        it("should return empty array when no equipment is due", async () => {
            mockDb.equipment.findMany.mockResolvedValue([
                {
                    id: "1",
                    status: "operational",
                    serviceIntervalDays: 365,
                    lastServiceDate: new Date(), // Just serviced
                },
            ] as any);

            const result = await equipmentActions.getServiceDueEquipment();

            expect(result).toEqual([]);
        });
    });

    describe("createEquipment", () => {
        it("should create equipment successfully", async () => {
            const eqData = {
                name: "Tractor",
                category: "tractor",
                status: "operational" as const,
            };

            mockDb.equipment.create.mockResolvedValue({ id: "1", ...eqData } as any);

            const result = await equipmentActions.createEquipment(eqData);

            expect(result).toEqual({ success: true });
            expect(mockDb.equipment.create).toHaveBeenCalledWith({
                data: expect.objectContaining(eqData),
            });
        });

        it("should fail with invalid data", async () => {
            const eqData = {
                name: "", // Invalid
                category: "", // Invalid
            };

            const result = await equipmentActions.createEquipment(eqData as any);

            expect(result).toEqual({ success: false, error: "Failed to create equipment" });
        });
    });

    describe("updateEquipment", () => {
        it("should update equipment successfully", async () => {
            const updateData = {
                name: "Tractor Updated",
                status: "needs-service" as const,
            };

            mockDb.equipment.update.mockResolvedValue({ id: "1", ...updateData } as any);

            const result = await equipmentActions.updateEquipment("1", updateData);

            expect(result).toEqual({ success: true });
            expect(mockDb.equipment.update).toHaveBeenCalledWith({
                where: { id: "1" },
                data: updateData,
            });
        });
    });

    describe("logMaintenance", () => {
        it("should log maintenance and update equipment", async () => {
            const maintData = {
                type: "routine" as const,
                date: new Date(),
                description: "Oil change",
                hoursAtService: 500,
            };

            mockDb.equipment.findUnique.mockResolvedValue({
                id: "1",
                status: "operational",
                currentHours: 500,
            } as any);
            mockDb.equipment.update.mockResolvedValue({ id: "1" } as any);
            mockDb.maintenanceRecord.create.mockResolvedValue({ id: "m1" } as any);

            const result = await equipmentActions.logMaintenance("1", maintData);

            expect(result).toEqual({ success: true });
            expect(mockDb.maintenanceRecord.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    ...maintData,
                    equipmentId: "1",
                }),
            });
        });

        it("should update status to operational after routine maintenance", async () => {
            const maintData = {
                type: "routine" as const,
                date: new Date(),
                description: "Service",
            };

            mockDb.equipment.findUnique.mockResolvedValue({
                id: "1",
                status: "needs-service",
                currentHours: 500,
            } as any);
            mockDb.equipment.update.mockResolvedValue({ id: "1" } as any);
            mockDb.maintenanceRecord.create.mockResolvedValue({ id: "m1" } as any);

            await equipmentActions.logMaintenance("1", maintData);

            expect(mockDb.equipment.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        status: "operational",
                    }),
                })
            );
        });

        it("should fail if equipment not found", async () => {
            mockDb.equipment.findUnique.mockResolvedValue(null);

            const result = await equipmentActions.logMaintenance("1", {
                type: "routine",
                date: new Date(),
                description: "Test",
            } as any);

            expect(result.success).toBe(false);
        });
    });

    describe("deleteEquipment", () => {
        it("should delete equipment successfully", async () => {
            mockDb.equipment.delete.mockResolvedValue({ id: "1" } as any);

            const result = await equipmentActions.deleteEquipment("1");

            expect(result).toEqual({ success: true });
            expect(mockDb.equipment.delete).toHaveBeenCalledWith({
                where: { id: "1" },
            });
        });
    });
});
