import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ACTION_REGISTRY, getAction } from '@/lib/action-registry';
import { syncQueue, queueMutation } from '@/lib/offline';

// The new syncQueue() batch-reads the entire queue first:
//   db.transaction(...).store.getAllKeys()
//   db.transaction(...).store.getAll()
//   tx.done
// Then deletes conflicts, then executes, then calls db.delete() per item.
const testEntry = { action: 'test.action', data: { foo: 'bar' }, timestamp: 123 };
const testKey = 'key-123';

const mockTxStore = {
    getAllKeys: vi.fn().mockResolvedValue([testKey]),
    getAll: vi.fn().mockResolvedValue([testEntry]),
    delete: vi.fn().mockResolvedValue(undefined),
};

const mockTx = {
    store: mockTxStore,
    done: Promise.resolve(),
};

const mockDb = {
    put: vi.fn(),
    delete: vi.fn().mockResolvedValue(undefined),
    transaction: vi.fn().mockReturnValue(mockTx),
};

vi.mock('idb', () => ({
    openDB: vi.fn(async () => mockDb),
}));

// Mock action registry
vi.mock('@/lib/action-registry', async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        getAction: vi.fn(),
    };
});

describe('Offline Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Re-apply defaults after clearAllMocks
        mockTxStore.getAllKeys.mockResolvedValue([testKey]);
        mockTxStore.getAll.mockResolvedValue([testEntry]);
        mockTxStore.delete.mockResolvedValue(undefined);
        mockDb.delete.mockResolvedValue(undefined);
        mockDb.transaction.mockReturnValue(mockTx);
    });

    it('should queue mutations with timestamps', async () => {
        await queueMutation('test.action', { foo: 'bar' });

        expect(mockDb.put).toHaveBeenCalledWith(
            'mutationQueue',
            expect.objectContaining({
                action: 'test.action',
                data: { foo: 'bar' },
                timestamp: expect.any(Number),
            }),
            expect.any(String)
        );
    });

    it('should sync queue by calling registered actions', async () => {
        const mockAction = vi.fn().mockResolvedValue({ success: true });
        (getAction as any).mockReturnValue(mockAction);

        const result = await syncQueue();

        expect(getAction).toHaveBeenCalledWith('test.action');
        expect(mockAction).toHaveBeenCalledWith({ foo: 'bar' });
        // Successful action → deleted from queue
        expect(mockDb.delete).toHaveBeenCalledWith('mutationQueue', testKey);
        expect(result.processed).toBe(1);
        expect(result.conflicts).toHaveLength(0);
    });

    it('returns zero processed for an empty queue', async () => {
        mockTxStore.getAllKeys.mockResolvedValue([]);
        mockTxStore.getAll.mockResolvedValue([]);

        const result = await syncQueue();
        expect(result.processed).toBe(0);
        expect(result.conflicts).toHaveLength(0);
    });

    it('should have a comprehensive action registry', () => {
        // Just verify some key actions are there
        expect(ACTION_REGISTRY['storage.create']).toBeDefined();
        expect(ACTION_REGISTRY['tasks.create']).toBeDefined();
        expect(ACTION_REGISTRY['weather.log']).toBeDefined();
    });
});
