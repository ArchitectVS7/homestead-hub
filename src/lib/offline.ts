import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { detectAndResolveConflicts, ConflictResolutionStrategy, ConflictRecord } from './sync-conflict-resolver';

interface HomesteadDB extends DBSchema {
    keyval: {
        key: string;
        value: any;
    };
    mutationQueue: {
        key: string; // timestamp + id
        value: {
            action: string;
            data: any;
            timestamp: number;
        };
    };
}

// Conflict history kept in memory for the current session so the UI can surface it
const conflictLog: ConflictRecord[] = [];

/** Returns a snapshot of all sync conflicts resolved in the current session. */
export function getConflictLog(): ConflictRecord[] {
    return [...conflictLog];
}

const DB_NAME = 'homestead-db';
const DB_VERSION = 1;

async function getDB(): Promise<IDBPDatabase<HomesteadDB>> {
    return openDB<HomesteadDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('keyval')) {
                db.createObjectStore('keyval');
            }
            if (!db.objectStoreNames.contains('mutationQueue')) {
                db.createObjectStore('mutationQueue');
            }
        },
    });
}

export async function cacheData(key: string, data: any): Promise<void> {
    const db = await getDB();
    await db.put('keyval', data, key);
}

export async function getCachedData(key: string): Promise<any | undefined> {
    const db = await getDB();
    return await db.get('keyval', key);
}

export async function queueMutation(action: string, data: any): Promise<void> {
    const db = await getDB();
    const timestamp = Date.now();
    const key = `${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
    await db.put('mutationQueue', { action, data, timestamp }, key);

    // Attempt sync immediately if online (simplified)
    if (navigator.onLine) {
        syncQueue();
    }
}

export async function getPendingMutationsCount(): Promise<number> {
    const db = await getDB();
    return await db.count('mutationQueue');
}

// Export event emitter for sync updates
type SyncListener = () => void;
const syncListeners: SyncListener[] = [];

export function subscribeToSync(listener: SyncListener): () => void {
    syncListeners.push(listener);
    return () => {
        const index = syncListeners.indexOf(listener);
        if (index > -1) {
            syncListeners.splice(index, 1);
        }
    };
}

function notifySyncListeners() {
    syncListeners.forEach(l => l());
}

export async function syncQueue(
    strategy: ConflictResolutionStrategy = 'lastWriteWins',
): Promise<{ processed: number; conflicts: ConflictRecord[] }> {
    const db = await getDB();

    // Batch-read the entire queue so we can run conflict resolution before
    // executing anything. This avoids partial-execution races.
    const tx = db.transaction('mutationQueue', 'readwrite');
    const store = tx.store;

    // Collect all entries with their IDB keys so we can delete them later
    const allKeys = await store.getAllKeys();
    const allValues = await store.getAll();
    await tx.done;

    if (allKeys.length === 0) {
        return { processed: 0, conflicts: [] };
    }

    console.log(`Starting sync: ${allKeys.length} mutation(s) queued`);

    // Detect and resolve intra-queue conflicts
    const { resolved, conflicts } = detectAndResolveConflicts(allValues, strategy);

    if (conflicts.length > 0) {
        console.warn(`Sync conflict resolution (${strategy}):`, conflicts);
        conflictLog.push(...conflicts);
    }

    // Lazy load registry to avoid circular deps during init
    const { getAction } = await import('./action-registry');

    // Build a set of timestamps that won conflict resolution — everything else
    // gets deleted without being executed.
    const resolvedTimestamps = new Set(resolved.map((m) => m.timestamp));

    // Delete all discarded mutations first
    const deleteTx = db.transaction('mutationQueue', 'readwrite');
    for (let i = 0; i < allKeys.length; i++) {
        const entry = allValues[i];
        if (!resolvedTimestamps.has(entry.timestamp)) {
            await deleteTx.store.delete(allKeys[i]);
        }
    }
    await deleteTx.done;

    // Execute resolved mutations in chronological order
    let processed = 0;
    for (const entry of resolved) {
        console.log(`Processing mutation: ${entry.action}`, entry.data);
        const action = getAction(entry.action);

        // Find the IDB key for this entry so we can delete it on success
        const idx = allValues.findIndex(
            (v) => v.timestamp === entry.timestamp && v.action === entry.action,
        );
        const idbKey = idx !== -1 ? allKeys[idx] : null;

        if (!action) {
            console.warn(`Action ${entry.action} not found in registry`);
            if (idbKey !== null) await db.delete('mutationQueue', idbKey);
            continue;
        }

        try {
            const result = await action(entry.data);
            if (result.success) {
                console.log(`Action ${entry.action} success`);
                if (idbKey !== null) await db.delete('mutationQueue', idbKey);
                processed++;
            } else {
                console.error(`Action ${entry.action} failed:`, result.error);
                // Leave in queue for retry on next sync
            }
        } catch (err) {
            console.error(`Action ${entry.action} threw error:`, err);
        }
    }

    notifySyncListeners();
    console.log(`Sync complete: ${processed} processed, ${conflicts.length} conflict(s) resolved`);

    return { processed, conflicts };
}

