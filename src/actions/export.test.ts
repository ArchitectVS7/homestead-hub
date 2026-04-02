import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";

vi.mock("@/lib/db", () => ({
  db: mockDeep<PrismaClient>(),
}));

import * as exportActions from "./export";
import { db } from "@/lib/db";

const mockDb = db as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

describe("Export Actions", () => {
  beforeEach(() => {
    mockReset(mockDb);
  });

  // ─── exportStorageCsv ───────────────────────────────────────────────────────

  describe("exportStorageCsv", () => {
    it("returns a CSV string with a header row", async () => {
      mockDb.storageItem.findMany.mockResolvedValue([]);
      const csv = await exportActions.exportStorageCsv();
      expect(typeof csv).toBe("string");
      expect(csv).toContain("Name");
      expect(csv).toContain("Category");
    });

    it("includes data rows for each storage item", async () => {
      mockDb.storageItem.findMany.mockResolvedValue([
        {
          id: "1",
          name: "Rice",
          category: "grains",
          quantity: 50,
          unit: "lbs",
          location: "Pantry",
          purchaseDate: null,
          expirationDate: null,
          calories: 1600,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any,
      ]);
      const csv = await exportActions.exportStorageCsv();
      expect(csv).toContain("Rice");
      expect(csv).toContain("grains");
      expect(csv).toContain("50");
      expect(csv).toContain("lbs");
    });

    it("queries storage items ordered by name", async () => {
      mockDb.storageItem.findMany.mockResolvedValue([]);
      await exportActions.exportStorageCsv();
      expect(mockDb.storageItem.findMany).toHaveBeenCalledWith({
        orderBy: { name: "asc" },
      });
    });
  });

  // ─── exportGardenCsv ────────────────────────────────────────────────────────

  describe("exportGardenCsv", () => {
    it("returns a CSV string with garden header row", async () => {
      mockDb.planting.findMany.mockResolvedValue([]);
      const csv = await exportActions.exportGardenCsv();
      expect(csv).toContain("Crop");
      expect(csv).toContain("Plant Date");
    });

    it("flattens nested crop data into rows", async () => {
      mockDb.planting.findMany.mockResolvedValue([
        {
          id: "p1",
          cropId: "c1",
          crop: { name: "Tomato", variety: "Roma" },
          location: "Bed A",
          quantity: 10,
          plantDate: new Date("2024-04-01T00:00:00.000Z"),
          expectedHarvest: null,
          actualHarvest: null,
          yield: null,
          yieldUnit: null,
          notes: "First planting",
        } as any,
      ]);
      const csv = await exportActions.exportGardenCsv();
      expect(csv).toContain("Tomato");
      expect(csv).toContain("Roma");
      expect(csv).toContain("Bed A");
      expect(csv).toContain("First planting");
    });

    it("includes crop relationship in DB query", async () => {
      mockDb.planting.findMany.mockResolvedValue([]);
      await exportActions.exportGardenCsv();
      expect(mockDb.planting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({ crop: expect.anything() }),
        })
      );
    });
  });

  // ─── exportLivestockCsv ─────────────────────────────────────────────────────

  describe("exportLivestockCsv", () => {
    it("returns a CSV string with livestock header row", async () => {
      mockDb.animal.findMany.mockResolvedValue([]);
      const csv = await exportActions.exportLivestockCsv();
      expect(csv).toContain("Name");
      expect(csv).toContain("Type");
      expect(csv).toContain("Status");
    });

    it("includes data for each animal", async () => {
      mockDb.animal.findMany.mockResolvedValue([
        {
          id: "a1",
          name: "Bessie",
          type: "cattle",
          breed: "Angus",
          birthDate: null,
          sex: "female",
          isNeutered: false,
          status: "active",
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any,
      ]);
      const csv = await exportActions.exportLivestockCsv();
      expect(csv).toContain("Bessie");
      expect(csv).toContain("cattle");
      expect(csv).toContain("Angus");
      expect(csv).toContain("active");
    });
  });

  // ─── exportEquipmentCsv ─────────────────────────────────────────────────────

  describe("exportEquipmentCsv", () => {
    it("returns a CSV string with equipment header row", async () => {
      mockDb.equipment.findMany.mockResolvedValue([]);
      const csv = await exportActions.exportEquipmentCsv();
      expect(csv).toContain("Name");
      expect(csv).toContain("Category");
      expect(csv).toContain("Status");
    });

    it("includes data for each piece of equipment", async () => {
      mockDb.equipment.findMany.mockResolvedValue([
        {
          id: "e1",
          name: "John Deere 3025E",
          category: "tractor",
          model: "3025E",
          serialNumber: "SN123",
          status: "operational",
          purchaseDate: null,
          lastServiceDate: null,
          serviceIntervalDays: 90,
          currentHours: 250,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any,
      ]);
      const csv = await exportActions.exportEquipmentCsv();
      expect(csv).toContain("John Deere 3025E");
      expect(csv).toContain("tractor");
      expect(csv).toContain("operational");
      expect(csv).toContain("3025E");
    });

    it("queries equipment ordered by name", async () => {
      mockDb.equipment.findMany.mockResolvedValue([]);
      await exportActions.exportEquipmentCsv();
      expect(mockDb.equipment.findMany).toHaveBeenCalledWith({
        orderBy: { name: "asc" },
      });
    });
  });
});
