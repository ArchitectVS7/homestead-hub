"use client";

import * as React from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getConflictLog, subscribeToSync } from "@/lib/offline";
import type { ConflictRecord } from "@/lib/sync-conflict-resolver";

function formatStrategy(strategy: string): string {
  return strategy.replace(/([A-Z])/g, " $1").toLowerCase();
}

interface SyncConflictBannerProps {
  className?: string;
}

export function SyncConflictBanner({ className }: SyncConflictBannerProps) {
  const [conflicts, setConflicts] = React.useState<ConflictRecord[]>([]);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    // Snapshot any conflicts that resolved before this component mounted
    const initial = getConflictLog();
    if (initial.length > 0) {
      setConflicts(initial);
    }

    // Re-snapshot after every sync cycle (new conflicts may have arrived)
    const unsubscribe = subscribeToSync(() => {
      const updated = getConflictLog();
      if (updated.length > 0) {
        setConflicts(updated);
        setDismissed(false); // Re-show banner when new conflicts appear
      }
    });

    return unsubscribe;
  }, []);

  if (conflicts.length === 0 || dismissed) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex flex-col gap-1 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 mx-2 mb-1",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-medium">
          <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>
            {conflicts.length} sync conflict{conflicts.length !== 1 ? "s" : ""}{" "}
            auto-resolved
          </span>
        </div>
        <button
          type="button"
          aria-label="Dismiss conflict notifications"
          onClick={() => setDismissed(true)}
          className="ml-2 rounded p-0.5 hover:bg-amber-100"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>

      <ul className="ml-4 list-disc space-y-0.5 text-amber-800">
        {conflicts.map((c, i) => (
          <li key={i}>
            <span className="font-mono">{c.resourceKey}</span>
            {" — "}
            <span>{formatStrategy(c.strategy)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
