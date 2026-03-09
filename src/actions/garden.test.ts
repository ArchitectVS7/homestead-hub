import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";

// Mock the db module with inline mock creation
vi.mock("@/lib/db", () => ({
    db: mockDeep<PrismaClient>(),
}));

// Import after mocking
import * as gardenActions from "./garden";
import { db } from "@/lib/db";

// Get reference to the mocked db
const mockDb = db as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

describe("Garden Actions", () => {
    beforeEach(() => {
        mockReset(mockDb);
    });

    describe("getCrops", () => {
        it("should return crops ordered by name", async () => {
            const mockCrops = [
                { id: "1", name: "Tomato", variety: "Roma", daysToMaturity: 80 },
                { id: "2", name: "Lettuce", variety: "Butterhead", daysToMaturity: 45 },
            ];

            mockDb.crop.findMany.mockResolvedValue(mockCrops as any);

            const result = await gardenActions.getCrops();

            expect(result).toEqual(mockCrops);
            expect(mockDb.crop.findMany).toHaveBeenCalledWith({
                orderBy: { name: "asc" },
            });
        });

        it("should return empty array when no crops exist", async () => {
            mockDb.crop.findMany.mockResolvedValue([]);

            const result = await gardenActions.getCrops();

            expect(result).toEqual([]);
        });
    });

    describe("getCropWithPlantings", () => {
        it("should return crop with its plantings", async () => {
            const mockCrop = {
                id: "1",
                name: "Tomato",
                variety: "Roma",
                daysToMaturity: 80,
                plantings: [
                    { id: "p1", cropId: "1", location: "Bed 1", plantDate: new Date() },
                ],
            };

            mockDb.crop.findUnique.mockResolvedValue(mockCrop as any);

            const result = await gardenActions.getCropWithPlantings("1");

            expect(result).toEqual(mockCrop);
            expect(mockDb.crop.findUnique).toHaveBeenCalledWith({
                where: { id: "1" },
                include: {
                    plantings: {
                        orderBy: { plantDate: "desc" },
                    },
                },
            });
        });
    });

    describe("createCrop", () => {
        it("should create a crop successfully", async () => {
            const cropData = {
                name: "Tomato",
                variety: "Roma",
                daysToMaturity: 80,
            };

            mockDb.crop.create.mockResolvedValue({ id: "1", ...cropData } as any);

            const result = await gardenActions.createCrop(cropData);

            expect(result).toEqual({ success: true });
            expect(mockDb.crop.create).toHaveBeenCalledWith({
                data: expect.objectContaining(cropData),
            });
        });

        it("should fail with invalid data", async () => {
            const cropData = {
                name: "", // Invalid: empty name
            };

            const result = await gardenActions.createCrop(cropData as any);

            expect(result).toEqual({ success: false, error: "Failed to create crop" });
        });

        it("should create crop with optional fields", async () => {
            const cropData = {
                name: "Tomato",
                variety: "Roma",
                daysToMaturity: 80,
                plantingDepth: "1/4 inch",
                spacing: "24 inches",
                sunRequirement: "full",
                waterRequirement: "medium",
                companionPlants: JSON.stringify(["basil", "carrot"]),
                incompatiblePlants: JSON.stringify(["potato"]),
                notes: "Great for sauces",
            };

            mockDb.crop.create.mockResolvedValue({ id: "1", ...cropData } as any);

            const result = await gardenActions.createCrop(cropData);

            expect(result.success).toBe(true);
        });
    });

    describe("updateCrop", () => {
        it("should update a crop successfully", async () => {
            const updateData = {
                name: "Tomato Updated",
                daysToMaturity: 85,
            };

            mockDb.crop.update.mockResolvedValue({ id: "1", ...updateData } as any);

            const result = await gardenActions.updateCrop("1", updateData);

            expect(result).toEqual({ success: true });
            expect(mockDb.crop.update).toHaveBeenCalledWith({
                where: { id: "1" },
                data: updateData,
            });
        });

        it("should handle partial updates", async () => {
            const updateData = {
                variety: "New Variety",
            };

            mockDb.crop.update.mockResolvedValue({ id: "1", ...updateData } as any);

            const result = await gardenActions.updateCrop("1", updateData);

            expect(result.success).toBe(true);
        });
    });

    describe("deleteCrop", () => {
        it("should delete a crop successfully", async () => {
            mockDb.crop.delete.mockResolvedValue({ id: "1" } as any);

            const result = await gardenActions.deleteCrop("1");

            expect(result).toEqual({ success: true });
            expect(mockDb.crop.delete).toHaveBeenCalledWith({
                where: { id: "1" },
            });
        });
    });

    describe("checkCompanionConflict", () => {
        it("should return no conflict when crop has no incompatible plants", async () => {
            mockDb.crop.findUnique.mockResolvedValue({
                id: "1",
                name: "Tomato",
                incompatiblePlants: null,
            } as any);

            const result = await gardenActions.checkCompanionConflict("1", "Bed 1");

            expect(result).toEqual({ hasConflict: false });
        });

        it("should return conflict when incompatible plant exists in location", async () => {
            mockDb.crop.findUnique.mockResolvedValue({
                id: "1",
                name: "Tomato",
                incompatiblePlants: JSON.stringify(["Potato"]),
            } as any);

            mockDb.planting.findMany.mockResolvedValue([
                {
                    id: "p1",
                    crop: { name: "Potato" },
                },
            ] as any);

            const result = await gardenActions.checkCompanionConflict("1", "Bed 1");

            expect(result.hasConflict).toBe(true);
            expect(result.conflictMessage).toContain("Potato is incompatible with Tomato");
        });

        it("should return no conflict when location has no plantings", async () => {
            mockDb.crop.findUnique.mockResolvedValue({
                id: "1",
                name: "Tomato",
                incompatiblePlants: JSON.stringify(["Potato"]),
            } as any);

            mockDb.planting.findMany.mockResolvedValue([]);

            const result = await gardenActions.checkCompanionConflict("1", "Bed 1");

            expect(result).toEqual({ hasConflict: false });
        });

        it("should only check active plantings (not harvested)", async () => {
            mockDb.crop.findUnique.mockResolvedValue({
                id: "1",
                name: "Tomato",
                incompatiblePlants: JSON.stringify(["Potato"]),
            } as any);

            // Mock the findMany to return empty when filtering by actualHarvest: null
            // The function filters for actualHarvest: null, so harvested plantings won't be returned
            mockDb.planting.findMany.mockImplementation(((args: any) => {
                // If filtering for active (actualHarvest: null), return empty
                if (args.where?.actualHarvest === null) {
                    return Promise.resolve([]);
                }
                // Otherwise return the harvested planting
                return Promise.resolve([
                    {
                        id: "p1",
                        actualHarvest: new Date(),
                        crop: { name: "Potato" },
                    },
                ]);
            }) as any);

            const result = await gardenActions.checkCompanionConflict("1", "Bed 1");

            expect(result).toEqual({ hasConflict: false });
        });
    });

    describe("getPlantings", () => {
        it("should return all plantings with crop info", async () => {
            const mockPlantings = [
                {
                    id: "1",
                    cropId: "1",
                    crop: { name: "Tomato", variety: "Roma", daysToMaturity: 80 },
                    location: "Bed 1",
                    plantDate: new Date(),
                    quantity: 5,
                },
            ];

            mockDb.planting.findMany.mockResolvedValue(mockPlantings as any);

            const result = await gardenActions.getPlantings();

            expect(result).toEqual(mockPlantings);
        });

        it("should filter by active status", async () => {
            mockDb.planting.findMany.mockResolvedValue([]);

            await gardenActions.getPlantings({ status: "active" });

            expect(mockDb.planting.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { actualHarvest: null },
                })
            );
        });

        it("should filter by harvested status", async () => {
            mockDb.planting.findMany.mockResolvedValue([]);

            await gardenActions.getPlantings({ status: "harvested" });

            expect(mockDb.planting.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { actualHarvest: { not: null } },
                })
            );
        });
    });

    describe("getPlantingsForMonth", () => {
        it("should return plantings for specified month", async () => {
            mockDb.planting.findMany.mockResolvedValue([]);

            await gardenActions.getPlantingsForMonth(2024, 5); // June 2024

            expect(mockDb.planting.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        OR: [
                            {
                                plantDate: {
                                    gte: new Date(2024, 5, 1),
                                    lte: new Date(2024, 5, 30),
                                },
                            },
                            {
                                expectedHarvest: {
                                    gte: new Date(2024, 5, 1),
                                    lte: new Date(2024, 5, 30),
                                },
                            },
                        ],
                    },
                })
            );
        });
    });

    describe("createPlanting", () => {
        it("should create planting successfully", async () => {
            const plantingData = {
                cropId: "1",
                location: "Bed 1",
                plantDate: new Date(),
                quantity: 5,
            };

            mockDb.crop.findUnique.mockResolvedValue(null);
            mockDb.planting.create.mockResolvedValue({ id: "1", ...plantingData } as any);

            const result = await gardenActions.createPlanting(plantingData);

            expect(result).toEqual({ success: true });
        });

        it("should calculate expected harvest from crop daysToMaturity", async () => {
            const plantingData = {
                cropId: "1",
                location: "Bed 1",
                plantDate: new Date("2024-06-01"),
                quantity: 5,
            };

            mockDb.crop.findUnique.mockResolvedValue({
                id: "1",
                daysToMaturity: 80,
            } as any);
            mockDb.planting.create.mockResolvedValue({ id: "1", ...plantingData } as any);

            await gardenActions.createPlanting(plantingData);

            expect(mockDb.planting.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    expectedHarvest: expect.any(Date),
                }),
            });
        });

        it("should fail when companion conflict exists", async () => {
            const plantingData = {
                cropId: "1",
                location: "Bed 1",
                plantDate: new Date(),
                quantity: 5,
            };

            // Mock conflict check to return conflict
            mockDb.crop.findUnique.mockResolvedValueOnce({
                id: "1",
                name: "Tomato",
                incompatiblePlants: JSON.stringify(["Potato"]),
            } as any);

            mockDb.planting.findMany.mockResolvedValue([
                { crop: { name: "Potato" } },
            ] as any);

            const result = await gardenActions.createPlanting(plantingData);

            expect(result.success).toBe(false);
            expect(result.error).toBe("Companion planting conflict");
        });
    });

    describe("updatePlanting", () => {
        it("should update planting successfully", async () => {
            const updateData = {
                location: "Bed 2",
                quantity: 10,
            };

            mockDb.planting.update.mockResolvedValue({ id: "1", ...updateData } as any);

            const result = await gardenActions.updatePlanting("1", updateData);

            expect(result).toEqual({ success: true });
            expect(mockDb.planting.update).toHaveBeenCalledWith({
                where: { id: "1" },
                data: updateData,
            });
        });
    });

    describe("logHarvest", () => {
        it("should log harvest successfully", async () => {
            const harvestData = {
                actualHarvest: new Date(),
                yieldQuantity: 5,
                yieldUnit: "lbs",
                notes: "Great harvest!",
            };

            mockDb.planting.update.mockResolvedValue({ id: "1" } as any);

            const result = await gardenActions.logHarvest("1", harvestData);

            expect(result).toEqual({ success: true });
            expect(mockDb.planting.update).toHaveBeenCalledWith({
                where: { id: "1" },
                data: {
                    actualHarvest: expect.any(Date),
                    yield: 5,
                    yieldUnit: "lbs",
                    notes: "Great harvest!",
                },
            });
        });

        it("should fail with invalid harvest data", async () => {
            const harvestData = {
                actualHarvest: new Date(),
                yieldQuantity: -5, // Invalid: negative
                yieldUnit: "lbs",
            };

            const result = await gardenActions.logHarvest("1", harvestData as any);

            expect(result).toEqual({ success: false, error: "Failed to log harvest" });
        });
    });

    describe("deletePlanting", () => {
        it("should delete planting successfully", async () => {
            mockDb.planting.delete.mockResolvedValue({ id: "1" } as any);

            const result = await gardenActions.deletePlanting("1");

            expect(result).toEqual({ success: true });
            expect(mockDb.planting.delete).toHaveBeenCalledWith({
                where: { id: "1" },
            });
        });
    });
});
