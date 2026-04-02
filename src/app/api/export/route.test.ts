import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock export actions before importing the route
vi.mock("@/actions/export", () => ({
  exportStorageCsv: vi.fn(),
  exportGardenCsv: vi.fn(),
  exportLivestockCsv: vi.fn(),
  exportEquipmentCsv: vi.fn(),
}));

import { GET } from "./route";
import * as exportActions from "@/actions/export";

function makeRequest(url: string): NextRequest {
  return new NextRequest(url);
}

describe("GET /api/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("valid module parameter", () => {
    it("returns CSV for storage module with correct headers", async () => {
      vi.mocked(exportActions.exportStorageCsv).mockResolvedValue("Name,Category\r\nRice,grains\r\n");

      const req = makeRequest("http://localhost/api/export?module=storage");
      const res = await GET(req);

      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
      expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="storage-inventory.csv"');
      expect(res.headers.get("Cache-Control")).toBe("no-store");
      const body = await res.text();
      expect(body).toContain("Name,Category");
    });

    it("returns CSV for garden module with correct filename", async () => {
      vi.mocked(exportActions.exportGardenCsv).mockResolvedValue("Crop,Variety\r\n");

      const req = makeRequest("http://localhost/api/export?module=garden");
      const res = await GET(req);

      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="garden-plantings.csv"');
    });

    it("returns CSV for livestock module with correct filename", async () => {
      vi.mocked(exportActions.exportLivestockCsv).mockResolvedValue("Name,Type\r\n");

      const req = makeRequest("http://localhost/api/export?module=livestock");
      const res = await GET(req);

      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="livestock.csv"');
    });

    it("returns CSV for equipment module with correct filename", async () => {
      vi.mocked(exportActions.exportEquipmentCsv).mockResolvedValue("Name,Category\r\n");

      const req = makeRequest("http://localhost/api/export?module=equipment");
      const res = await GET(req);

      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="equipment.csv"');
    });

    it("calls the correct action for each module", async () => {
      vi.mocked(exportActions.exportStorageCsv).mockResolvedValue("");
      vi.mocked(exportActions.exportGardenCsv).mockResolvedValue("");
      vi.mocked(exportActions.exportLivestockCsv).mockResolvedValue("");
      vi.mocked(exportActions.exportEquipmentCsv).mockResolvedValue("");

      await GET(makeRequest("http://localhost/api/export?module=storage"));
      expect(exportActions.exportStorageCsv).toHaveBeenCalledOnce();
      expect(exportActions.exportGardenCsv).not.toHaveBeenCalled();

      await GET(makeRequest("http://localhost/api/export?module=garden"));
      expect(exportActions.exportGardenCsv).toHaveBeenCalledOnce();

      await GET(makeRequest("http://localhost/api/export?module=livestock"));
      expect(exportActions.exportLivestockCsv).toHaveBeenCalledOnce();

      await GET(makeRequest("http://localhost/api/export?module=equipment"));
      expect(exportActions.exportEquipmentCsv).toHaveBeenCalledOnce();
    });
  });

  describe("invalid module parameter", () => {
    it("returns 400 for missing module parameter", async () => {
      const req = makeRequest("http://localhost/api/export");
      const res = await GET(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain("module");
      expect(body.valid).toEqual(["storage", "garden", "livestock", "equipment"]);
    });

    it("returns 400 for unknown module value", async () => {
      const req = makeRequest("http://localhost/api/export?module=animals");
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("returns 400 for empty module string", async () => {
      const req = makeRequest("http://localhost/api/export?module=");
      const res = await GET(req);

      expect(res.status).toBe(400);
    });
  });

  describe("export failure handling", () => {
    it("returns 500 when the export action throws", async () => {
      vi.mocked(exportActions.exportStorageCsv).mockRejectedValue(new Error("DB connection failed"));

      const req = makeRequest("http://localhost/api/export?module=storage");
      const res = await GET(req);

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe("Export failed. Please try again.");
    });
  });
});
