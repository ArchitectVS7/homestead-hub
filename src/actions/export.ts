"use server";

/**
 * Export Actions — CSV data export for all four homestead modules
 *
 * Each function fetches data from the database and serializes it to a
 * CSV string using src/lib/csv.ts. The API route (src/app/api/export/)
 * calls these and streams the result as a downloadable file.
 */

import { db } from "@/lib/db";
import {
  toCsv,
  STORAGE_COLUMNS,
  GARDEN_COLUMNS,
  LIVESTOCK_COLUMNS,
  EQUIPMENT_COLUMNS,
} from "@/lib/csv";

export async function exportStorageCsv(): Promise<string> {
  const items = await db.storageItem.findMany({
    orderBy: { name: "asc" },
  });
  return toCsv(items as Record<string, unknown>[], STORAGE_COLUMNS);
}

export async function exportGardenCsv(): Promise<string> {
  const plantings = await db.planting.findMany({
    include: {
      crop: { select: { name: true, variety: true } },
    },
    orderBy: { plantDate: "desc" },
  });

  // Flatten the nested crop relation into a flat row for CSV
  const rows = plantings.map((p) => ({
    cropName: p.crop.name,
    variety: p.crop.variety,
    location: p.location,
    quantity: p.quantity,
    plantDate: p.plantDate,
    expectedHarvest: p.expectedHarvest,
    actualHarvest: p.actualHarvest,
    yield: p.yield,
    yieldUnit: p.yieldUnit,
    notes: p.notes,
  }));

  return toCsv(rows as Record<string, unknown>[], GARDEN_COLUMNS);
}

export async function exportLivestockCsv(): Promise<string> {
  const animals = await db.animal.findMany({
    orderBy: { name: "asc" },
  });
  return toCsv(animals as Record<string, unknown>[], LIVESTOCK_COLUMNS);
}

export async function exportEquipmentCsv(): Promise<string> {
  const equipment = await db.equipment.findMany({
    orderBy: { name: "asc" },
  });
  return toCsv(equipment as Record<string, unknown>[], EQUIPMENT_COLUMNS);
}
