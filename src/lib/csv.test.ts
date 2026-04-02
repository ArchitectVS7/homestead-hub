import { describe, it, expect } from "vitest";
import {
  escapeCell,
  toCsv,
  STORAGE_COLUMNS,
  GARDEN_COLUMNS,
  LIVESTOCK_COLUMNS,
  EQUIPMENT_COLUMNS,
} from "./csv";

// ─── escapeCell ───────────────────────────────────────────────────────────────

describe("escapeCell", () => {
  it("returns empty string for null", () => {
    expect(escapeCell(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(escapeCell(undefined)).toBe("");
  });

  it("returns string representation of numbers", () => {
    expect(escapeCell(42)).toBe("42");
    expect(escapeCell(3.14)).toBe("3.14");
    expect(escapeCell(0)).toBe("0");
  });

  it("returns string representation of booleans", () => {
    expect(escapeCell(true)).toBe("true");
    expect(escapeCell(false)).toBe("false");
  });

  it("returns plain string unchanged when no special chars", () => {
    expect(escapeCell("hello")).toBe("hello");
    expect(escapeCell("Tractor 3000")).toBe("Tractor 3000");
  });

  it("wraps in quotes when value contains a comma", () => {
    expect(escapeCell("Salt, Pepper")).toBe('"Salt, Pepper"');
  });

  it("wraps in quotes and escapes embedded double-quotes", () => {
    expect(escapeCell('He said "hello"')).toBe('"He said ""hello"""');
  });

  it("wraps in quotes when value contains newline", () => {
    const result = escapeCell("line1\nline2");
    expect(result).toBe('"line1\nline2"');
  });

  it("wraps in quotes when value contains carriage return", () => {
    const result = escapeCell("line1\r\nline2");
    expect(result).toBe('"line1\r\nline2"');
  });

  it("serializes Date objects to ISO string", () => {
    const d = new Date("2024-06-15T00:00:00.000Z");
    const result = escapeCell(d);
    expect(result).toBe("2024-06-15T00:00:00.000Z");
  });

  it("wraps Date ISO string in quotes if it would contain commas (edge)", () => {
    // ISO dates don't normally contain commas, but verify Date is stringified before quoting check
    const d = new Date("2024-06-15T00:00:00.000Z");
    expect(escapeCell(d)).not.toContain(",");
  });
});

// ─── toCsv ────────────────────────────────────────────────────────────────────

describe("toCsv", () => {
  const columns = [
    { key: "name" as const, header: "Name" },
    { key: "qty" as const, header: "Quantity" },
    { key: "note" as const, header: "Notes" },
  ];

  it("produces header-only CSV for empty array", () => {
    const result = toCsv([], columns);
    expect(result).toBe("Name,Quantity,Notes\r\n");
  });

  it("produces header + data rows", () => {
    const rows = [
      { name: "Rice", qty: 50, note: null },
      { name: "Beans", qty: 20, note: "FIFO" },
    ];
    const result = toCsv(rows as any, columns);
    const lines = result.split("\r\n").filter(Boolean);
    expect(lines).toHaveLength(3); // header + 2 data rows
    expect(lines[0]).toBe("Name,Quantity,Notes");
    expect(lines[1]).toBe("Rice,50,");
    expect(lines[2]).toBe("Beans,20,FIFO");
  });

  it("ends with CRLF", () => {
    const result = toCsv([{ name: "x", qty: 1, note: "" }] as any, columns);
    expect(result.endsWith("\r\n")).toBe(true);
  });

  it("escapes special characters in values", () => {
    const rows = [{ name: "Salt, Sea", qty: 10, note: 'Has "quotes"' }];
    const result = toCsv(rows as any, columns);
    expect(result).toContain('"Salt, Sea"');
    expect(result).toContain('"Has ""quotes"""');
  });

  it("respects column order defined in columns array", () => {
    const reversed = [
      { key: "note" as const, header: "Notes" },
      { key: "qty" as const, header: "Quantity" },
      { key: "name" as const, header: "Name" },
    ];
    const rows = [{ name: "Rice", qty: 50, note: "old" }];
    const result = toCsv(rows as any, reversed);
    const dataLine = result.split("\r\n")[1];
    expect(dataLine).toBe("old,50,Rice");
  });

  it("serializes Date objects in rows", () => {
    const dateCols = [
      { key: "name" as const, header: "Name" },
      { key: "date" as const, header: "Date" },
    ];
    const d = new Date("2024-01-01T00:00:00.000Z");
    const rows = [{ name: "Test", date: d }];
    const result = toCsv(rows as any, dateCols);
    expect(result).toContain("2024-01-01T00:00:00.000Z");
  });

  it("handles null values as empty cells", () => {
    const rows = [{ name: "Wheat", qty: null, note: null }];
    const result = toCsv(rows as any, columns);
    const dataLine = result.split("\r\n")[1];
    expect(dataLine).toBe("Wheat,,");
  });
});

// ─── Column definition smoke tests ───────────────────────────────────────────

describe("column definitions", () => {
  it("STORAGE_COLUMNS has 9 columns with non-empty headers", () => {
    expect(STORAGE_COLUMNS).toHaveLength(9);
    for (const col of STORAGE_COLUMNS) {
      expect(col.header.length).toBeGreaterThan(0);
      expect(col.key.length).toBeGreaterThan(0);
    }
  });

  it("GARDEN_COLUMNS has 10 columns", () => {
    expect(GARDEN_COLUMNS).toHaveLength(10);
  });

  it("LIVESTOCK_COLUMNS has 8 columns", () => {
    expect(LIVESTOCK_COLUMNS).toHaveLength(8);
  });

  it("EQUIPMENT_COLUMNS has 10 columns", () => {
    expect(EQUIPMENT_COLUMNS).toHaveLength(10);
  });

  it("no duplicate headers within each column set", () => {
    for (const cols of [STORAGE_COLUMNS, GARDEN_COLUMNS, LIVESTOCK_COLUMNS, EQUIPMENT_COLUMNS]) {
      const headers = cols.map((c) => c.header);
      const unique = new Set(headers);
      expect(unique.size).toBe(headers.length);
    }
  });
});
