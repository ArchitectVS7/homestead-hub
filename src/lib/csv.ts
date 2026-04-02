/**
 * CSV serialization utility
 *
 * Pure functions — no I/O, no side effects. Converts typed data arrays
 * into RFC 4180-compliant CSV strings suitable for file download.
 */

/**
 * Escape a single cell value per RFC 4180:
 * - Wrap in quotes if the value contains commas, double-quotes, or newlines
 * - Escape embedded double-quotes by doubling them
 */
export function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str =
    value instanceof Date ? value.toISOString() : String(value);

  // Needs quoting if it contains comma, double-quote, CR, or LF
  if (str.includes(",") || str.includes('"') || str.includes("\r") || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Serialize an array of objects to a CSV string.
 *
 * @param rows    Array of plain objects (values may be string | number | boolean | Date | null)
 * @param columns Ordered list of { key, header } descriptors.
 *                `key` is the object property to read; `header` is the column label.
 * @returns       Complete CSV string including header row, CRLF line endings (RFC 4180).
 */
export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: keyof T; header: string }[]
): string {
  const headerRow = columns.map((c) => escapeCell(c.header)).join(",");

  if (rows.length === 0) return headerRow + "\r\n";

  const dataRows = rows.map((row) =>
    columns.map((c) => escapeCell(row[c.key])).join(",")
  );

  return [headerRow, ...dataRows].join("\r\n") + "\r\n";
}

// ─── Column definitions for each module ──────────────────────────────────────

export const STORAGE_COLUMNS = [
  { key: "name" as const,           header: "Name" },
  { key: "category" as const,       header: "Category" },
  { key: "quantity" as const,       header: "Quantity" },
  { key: "unit" as const,           header: "Unit" },
  { key: "location" as const,       header: "Location" },
  { key: "purchaseDate" as const,   header: "Purchase Date" },
  { key: "expirationDate" as const, header: "Expiration Date" },
  { key: "calories" as const,       header: "Calories/Unit" },
  { key: "notes" as const,          header: "Notes" },
];

export const GARDEN_COLUMNS = [
  { key: "cropName" as const,        header: "Crop" },
  { key: "variety" as const,         header: "Variety" },
  { key: "location" as const,        header: "Location" },
  { key: "quantity" as const,        header: "Quantity" },
  { key: "plantDate" as const,       header: "Plant Date" },
  { key: "expectedHarvest" as const, header: "Expected Harvest" },
  { key: "actualHarvest" as const,   header: "Actual Harvest" },
  { key: "yield" as const,           header: "Yield" },
  { key: "yieldUnit" as const,       header: "Yield Unit" },
  { key: "notes" as const,           header: "Notes" },
];

export const LIVESTOCK_COLUMNS = [
  { key: "name" as const,       header: "Name" },
  { key: "type" as const,       header: "Type" },
  { key: "breed" as const,      header: "Breed" },
  { key: "birthDate" as const,  header: "Birth Date" },
  { key: "sex" as const,        header: "Sex" },
  { key: "isNeutered" as const, header: "Neutered" },
  { key: "status" as const,     header: "Status" },
  { key: "notes" as const,      header: "Notes" },
];

export const EQUIPMENT_COLUMNS = [
  { key: "name" as const,                header: "Name" },
  { key: "category" as const,            header: "Category" },
  { key: "model" as const,               header: "Model" },
  { key: "serialNumber" as const,        header: "Serial Number" },
  { key: "status" as const,              header: "Status" },
  { key: "purchaseDate" as const,        header: "Purchase Date" },
  { key: "lastServiceDate" as const,     header: "Last Service Date" },
  { key: "serviceIntervalDays" as const, header: "Service Interval (Days)" },
  { key: "currentHours" as const,        header: "Current Hours" },
  { key: "notes" as const,               header: "Notes" },
];

export type ExportModule = "storage" | "garden" | "livestock" | "equipment";
