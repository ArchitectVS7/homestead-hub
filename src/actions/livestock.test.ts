import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";

// Mock the db module
vi.mock("@/lib/db", () => ({
    db: mockDeep<PrismaClient>(),
}));

// Import after mocking
import * as livestockActions from "./livestock";
import { db } from "@/lib/db";

const mockDb = db as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

describe("Livestock Actions - Production Stats", () => {
    beforeEach(() => {
        mockReset(mockDb);
    });

    describe("getProductionStats", () => {
        it("should return empty object when no production logs", async () => {
            mockDb.productionLog.findMany.mockResolvedValue([]);

            const result = await livestockActions.getProductionStats();

            expect(result).toEqual({});
        });

        it("should aggregate production by type and unit", async () => {
            const logs = [
                { type: "eggs", unit: "count", quantity: 10 },
                { type: "eggs", unit: "count", quantity: 15 },
                { type: "milk", unit: "gallons", quantity: 5 },
            ];

            mockDb.productionLog.findMany.mockResolvedValue(logs as any);

            const result = await livestockActions.getProductionStats();

            expect(result["eggs (count)"]).toBe(25);
            expect(result["milk (gallons)"]).toBe(5);
        });

        it("should only include logs from last 30 days", async () => {
            mockDb.productionLog.findMany.mockResolvedValue([]);

            await livestockActions.getProductionStats();

            expect(mockDb.productionLog.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        date: expect.objectContaining({
                            gte: expect.any(Date),
                        }),
                    }),
                })
            );
        });
    });

    describe("getProductionChartData", () => {
        it("should return array with dates even when no production logs", async () => {
            mockDb.productionLog.findMany.mockResolvedValue([]);

            const result = await livestockActions.getProductionChartData(7);

            // Function returns all dates in range, even with no data
            expect(result).toHaveLength(7);
            expect(result[0]).toHaveProperty("date");
        });

        it("should aggregate production by date", async () => {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            const logs = [
                { type: "eggs", quantity: 10, date: today },
                { type: "eggs", quantity: 5, date: today },
                { type: "milk", quantity: 3, date: yesterday },
            ];

            mockDb.productionLog.findMany.mockResolvedValue(logs as any);

            const result = await livestockActions.getProductionChartData(7);

            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBe(7); // 7 days of data
        });

        it("should include all dates in range even with no data", async () => {
            mockDb.productionLog.findMany.mockResolvedValue([]);

            const result = await livestockActions.getProductionChartData(5);

            expect(result.length).toBe(5);
        });

        it("should aggregate production data by date", async () => {
            const today = new Date();
            const todayStr = today.toISOString().split("T")[0];
            
            const logs = [
                { type: "eggs", quantity: 10, date: today },
                { type: "eggs", quantity: 5, date: today },
            ];

            mockDb.productionLog.findMany.mockResolvedValue(logs as any);

            const result = await livestockActions.getProductionChartData(1) as any;

            // Should have 1 day of data
            expect(result).toHaveLength(1);
            // Find the entry for today and check eggs total
            const todayEntry = result.find((r: any) => r.date === todayStr);
            expect(todayEntry?.eggs).toBe(15);
        });
    });

    describe("getProductionByType", () => {
        it("should return empty array when no production logs", async () => {
            mockDb.productionLog.findMany.mockResolvedValue([]);

            const result = await livestockActions.getProductionByType();

            expect(result).toEqual([]);
        });

        it("should group production by animal type and production type", async () => {
            const logs = [
                { 
                    type: "eggs", 
                    unit: "count", 
                    quantity: 10,
                    animal: { type: "chicken" },
                },
                { 
                    type: "eggs", 
                    unit: "count", 
                    quantity: 5,
                    animal: { type: "chicken" },
                },
                { 
                    type: "milk", 
                    unit: "gallons", 
                    quantity: 3,
                    animal: { type: "cow" },
                },
            ];

            mockDb.productionLog.findMany.mockResolvedValue(logs as any);

            const result = await livestockActions.getProductionByType();

            expect(result).toContainEqual(
                expect.objectContaining({
                    name: expect.stringContaining("chicken"),
                    value: 15,
                })
            );
            expect(result).toContainEqual(
                expect.objectContaining({
                    name: expect.stringContaining("cow"),
                    value: 3,
                })
            );
        });

        it("should include animal type in query", async () => {
            mockDb.productionLog.findMany.mockResolvedValue([]);

            await livestockActions.getProductionByType();

            expect(mockDb.productionLog.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: {
                        animal: {
                            select: { type: true },
                        },
                    },
                })
            );
        });
    });

    describe("getHealthReminders", () => {
        it("should return empty array when no health records due", async () => {
            mockDb.healthRecord.findMany.mockResolvedValue([]);

            const result = await livestockActions.getHealthReminders(30);

            expect(result).toEqual([]);
        });

        it("should return health records with nextDue in range", async () => {
            const records = [
                {
                    id: "1",
                    type: "vaccination",
                    nextDue: new Date(),
                    animal: { name: "Bessie" },
                },
            ];

            mockDb.healthRecord.findMany.mockResolvedValue(records as any);

            const result = await livestockActions.getHealthReminders(30);

            expect(result.length).toBe(1);
            expect(result[0].title).toContain("Bessie");
        });

        it("should order by nextDue ascending", async () => {
            mockDb.healthRecord.findMany.mockResolvedValue([]);

            await livestockActions.getHealthReminders(30);

            expect(mockDb.healthRecord.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { nextDue: "asc" },
                })
            );
        });

        it("should include animal information", async () => {
            mockDb.healthRecord.findMany.mockResolvedValue([]);

            await livestockActions.getHealthReminders(30);

            expect(mockDb.healthRecord.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: { animal: true },
                })
            );
        });
    });

    describe("getAnimalById", () => {
        it("should return animal with parent and offspring", async () => {
            const mockAnimal = {
                id: "1",
                name: "Bessie",
                parent: { id: "p1", name: "Daisy" },
                offspring: [{ id: "o1", name: "Calf1" }],
                healthRecords: [],
                productionLogs: [],
            };

            mockDb.animal.findUnique.mockResolvedValue(mockAnimal as any);

            const result = await livestockActions.getAnimalById("1");

            expect(result).toEqual(mockAnimal);
            expect(mockDb.animal.findUnique).toHaveBeenCalledWith({
                where: { id: "1" },
                include: {
                    healthRecords: { orderBy: { date: "desc" } },
                    productionLogs: { orderBy: { date: "desc" }, take: 20 },
                    offspring: true,
                    parent: true,
                },
            });
        });

        it("should return null if animal not found", async () => {
            mockDb.animal.findUnique.mockResolvedValue(null);

            const result = await livestockActions.getAnimalById("nonexistent");

            expect(result).toBeNull();
        });
    });
});
