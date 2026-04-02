// @vitest-environment happy-dom
/**
 * Tests for SyncConflictBanner — the component that surfaces
 * getConflictLog() to users whenever the sync engine silently resolves
 * offline edit conflicts.
 */

import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Module mocks ─────────────────────────────────────────────────────────────

// Capture the sync listener registered by the component so tests can fire it
let capturedSyncListener: (() => void) | null = null;
let mockConflictLog: import("@/lib/sync-conflict-resolver").ConflictRecord[] = [];

vi.mock("@/lib/offline", () => ({
  getConflictLog: () => [...mockConflictLog],
  subscribeToSync: (listener: () => void) => {
    capturedSyncListener = listener;
    // Return unsubscribe fn
    return () => {
      capturedSyncListener = null;
    };
  },
}));

// Silence lucide-react SVG rendering in happy-dom
vi.mock("lucide-react", () => ({
  AlertTriangle: () => React.createElement("span", { "data-testid": "icon-alert" }),
  X: () => React.createElement("span", { "data-testid": "icon-x" }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

import { SyncConflictBanner } from "@/components/ui/sync-conflict-banner";
import type { ConflictRecord } from "@/lib/sync-conflict-resolver";

function makeConflict(overrides: Partial<ConflictRecord> = {}): ConflictRecord {
  return {
    resourceKey: "storage:42",
    action: "storage.update",
    strategy: "lastWriteWins",
    keptTimestamp: 1_000_000,
    discardedTimestamps: [999_999],
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("SyncConflictBanner", () => {
  beforeEach(() => {
    mockConflictLog = [];
    capturedSyncListener = null;
    vi.clearAllMocks();
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it("renders nothing when there are no conflicts", () => {
    mockConflictLog = [];
    const { container } = render(<SyncConflictBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("renders an alert when conflicts exist at mount time", () => {
    mockConflictLog = [makeConflict()];
    render(<SyncConflictBanner />);
    expect(screen.getByRole("alert")).toBeDefined();
  });

  it("shows a count of conflicts in the heading", () => {
    mockConflictLog = [makeConflict(), makeConflict({ resourceKey: "livestock:7" })];
    render(<SyncConflictBanner />);
    expect(screen.getByRole("alert").textContent).toContain("2 sync conflicts");
  });

  it("uses singular wording for a single conflict", () => {
    mockConflictLog = [makeConflict()];
    render(<SyncConflictBanner />);
    expect(screen.getByRole("alert").textContent).toContain("1 sync conflict ");
    expect(screen.getByRole("alert").textContent).not.toContain("1 sync conflicts");
  });

  it("lists each conflict's resourceKey", () => {
    mockConflictLog = [
      makeConflict({ resourceKey: "storage:42" }),
      makeConflict({ resourceKey: "livestock:7" }),
    ];
    render(<SyncConflictBanner />);
    const alertText = screen.getByRole("alert").textContent ?? "";
    expect(alertText).toContain("storage:42");
    expect(alertText).toContain("livestock:7");
  });

  it("shows a human-readable strategy label", () => {
    mockConflictLog = [makeConflict({ strategy: "lastWriteWins" })];
    render(<SyncConflictBanner />);
    expect(screen.getByRole("alert").textContent).toContain("last write wins");
  });

  it("renders a dismiss button", () => {
    mockConflictLog = [makeConflict()];
    render(<SyncConflictBanner />);
    expect(
      screen.getByRole("button", { name: /dismiss conflict notifications/i }),
    ).toBeDefined();
  });

  // ── Dismiss ───────────────────────────────────────────────────────────────

  it("hides the banner when the dismiss button is clicked", async () => {
    mockConflictLog = [makeConflict()];
    render(<SyncConflictBanner />);

    const btn = screen.getByRole("button", { name: /dismiss/i });
    await userEvent.click(btn);

    expect(screen.queryByRole("alert")).toBeNull();
  });

  // ── Reactive sync updates ─────────────────────────────────────────────────

  it("registers a sync listener on mount", () => {
    mockConflictLog = [];
    render(<SyncConflictBanner />);
    expect(capturedSyncListener).not.toBeNull();
  });

  it("shows the banner when a sync event brings new conflicts", () => {
    mockConflictLog = []; // starts empty → banner hidden
    render(<SyncConflictBanner />);
    expect(screen.queryByRole("alert")).toBeNull();

    // Simulate a sync cycle that produced a conflict
    mockConflictLog = [makeConflict()];
    act(() => {
      capturedSyncListener!();
    });

    expect(screen.getByRole("alert")).toBeDefined();
  });

  it("re-shows the banner after dismiss when a new sync cycle brings conflicts", async () => {
    mockConflictLog = [makeConflict()];
    render(<SyncConflictBanner />);

    // Dismiss
    await userEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(screen.queryByRole("alert")).toBeNull();

    // New conflict arrives via sync
    mockConflictLog = [makeConflict(), makeConflict({ resourceKey: "garden:3" })];
    act(() => {
      capturedSyncListener!();
    });

    expect(screen.getByRole("alert")).toBeDefined();
  });

  it("unsubscribes from sync events on unmount", () => {
    mockConflictLog = [];
    const { unmount } = render(<SyncConflictBanner />);
    expect(capturedSyncListener).not.toBeNull();

    unmount();
    expect(capturedSyncListener).toBeNull();
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  it("has role=alert and aria-live=polite for screen reader announcement", () => {
    mockConflictLog = [makeConflict()];
    render(<SyncConflictBanner />);
    const alert = screen.getByRole("alert");
    expect(alert.getAttribute("aria-live")).toBe("polite");
  });
});
