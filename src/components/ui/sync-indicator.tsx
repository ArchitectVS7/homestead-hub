"use client";

import * as React from "react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { getPendingMutationsCount, subscribeToSync, syncQueue } from "@/lib/offline";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function SyncIndicator() {
    const isOnline = useNetworkStatus();
    const [pendingCount, setPendingCount] = React.useState(0);
    const [isSyncing, setIsSyncing] = React.useState(false);

    // Update pending count whenever network status changes or sync occurs
    const updateCount = React.useCallback(async () => {
        try {
            const count = await getPendingMutationsCount();
            setPendingCount(count);
        } catch (e) {
            console.error("Failed to get pending mutations", e);
        }
    }, []);

    React.useEffect(() => {
        updateCount();

        const unsubscribe = subscribeToSync(() => {
            updateCount();
        });

        return unsubscribe;
    }, [updateCount]);

    const handleSync = React.useCallback(async () => {
        if (!isOnline) return;
        setIsSyncing(true);
        try {
            await syncQueue();
            await updateCount();
        } finally {
            setIsSyncing(false);
        }
    }, [isOnline, updateCount]);

    // Auto-sync when coming back online. pendingCount is intentionally
    // excluded from deps to avoid a sync loop; this effect should only
    // trigger on network status changes.
    React.useEffect(() => {
        if (isOnline && pendingCount > 0) {
            handleSync();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline, handleSync]);

    if (isOnline && pendingCount === 0) {
        return (
            <div className="flex items-center gap-2 text-xs text-stone-500 px-4 py-2 opacity-50 hover:opacity-100 transition-opacity">
                <Cloud className="h-3 w-3" />
                <span>Synced</span>
            </div>
        );
    }

    return (
        <div className={cn(
            "flex items-center gap-2 text-xs px-4 py-2 font-medium rounded-md mx-2",
            !isOnline ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-blue-100 text-blue-800 border border-blue-200"
        )}>
            {!isOnline ? (
                <>
                    <CloudOff className="h-3 w-3" />
                    <span>Offline ({pendingCount})</span>
                </>
            ) : (
                <button onClick={handleSync} disabled={isSyncing} className="flex items-center gap-2 w-full hover:underline">
                    <RefreshCw className={cn("h-3 w-3", isSyncing && "animate-spin")} />
                    <span>{isSyncing ? "Syncing..." : `Sync Pending (${pendingCount})`}</span>
                </button>
            )}
        </div>
    );
}
