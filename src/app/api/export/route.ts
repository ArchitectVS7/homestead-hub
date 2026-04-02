import { NextRequest, NextResponse } from "next/server";
import {
  exportStorageCsv,
  exportGardenCsv,
  exportLivestockCsv,
  exportEquipmentCsv,
} from "@/actions/export";
import type { ExportModule } from "@/lib/csv";

const EXPORT_HANDLERS: Record<ExportModule, () => Promise<string>> = {
  storage:   exportStorageCsv,
  garden:    exportGardenCsv,
  livestock: exportLivestockCsv,
  equipment: exportEquipmentCsv,
};

const FILENAMES: Record<ExportModule, string> = {
  storage:   "storage-inventory.csv",
  garden:    "garden-plantings.csv",
  livestock: "livestock.csv",
  equipment: "equipment.csv",
};

/**
 * GET /api/export?module=storage|garden|livestock|equipment
 *
 * Returns a downloadable CSV file for the requested module.
 * The `module` query parameter is required.
 *
 * @example
 *   fetch('/api/export?module=storage').then(r => r.blob())
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const exportModule = searchParams.get("module") as ExportModule | null;

  if (!exportModule || !(exportModule in EXPORT_HANDLERS)) {
    return NextResponse.json(
      {
        error: "Invalid or missing `module` parameter.",
        valid: Object.keys(EXPORT_HANDLERS),
      },
      { status: 400 }
    );
  }

  try {
    const csv = await EXPORT_HANDLERS[exportModule]();
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${FILENAMES[exportModule]}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(`[export] failed for module=${exportModule}:`, error);
    return NextResponse.json(
      { error: "Export failed. Please try again." },
      { status: 500 }
    );
  }
}
