import { openDB, DBSchema, IDBPDatabase } from 'idb';

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

export async function syncQueue(): Promise<void> {
    const db = await getDB();
    const cursor = await db.transaction('mutationQueue', 'readwrite').store.openCursor();

    // Lazy load registry to avoid circular deps during init
    const { getAction } = await import('./action-registry');

    if (cursor) {
        console.log("Starting sync...");

        let c: typeof cursor | null = cursor;
        while (c) {
            const entry = c.value;
            console.log(`Processing mutation: ${entry.action}`, entry.data);

            const action = getAction(entry.action);

            if (action) {
                try {
                    const result = await action(entry.data);

                    if (result.success) {
                        console.log(`Action ${entry.action} success`);
                        await c.delete(); // Remove from queue
                    } else {
                        console.error(`Action ${entry.action} failed:`, result.error);
                        // Optional: Move to dead-letter queue or retry later
                        // For now, we leave it in queue to retry
                        // But we advance cursor to not block others? 
                        // Actually, strict ordering is simpler. blocked item blocks subsequence.
                    }
                } catch (err) {
                    console.error(`Action ${entry.action} threw error:`, err);
                }
            } else {
                console.warn(`Action ${entry.action} not found in registry`);
                await c.delete(); // Bad entry, remove it
            }

            c = await c.continue();
        }

        notifySyncListeners();
        console.log("Sync complete");
    }
}

