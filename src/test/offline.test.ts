import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ACTION_REGISTRY, getAction } from '@/lib/action-registry';
import { syncQueue, queueMutation } from '@/lib/offline';

// Mock mocks
const mockStore = {
    put: vi.fn(),
    delete: vi.fn(),
};

const mockCursor = {
    value: { action: 'test.action', data: { foo: 'bar' }, timestamp: 123 },
    delete: vi.fn(),
    continue: vi.fn().mockResolvedValue(null),
};

const mockTransaction = {
    store: {
        openCursor: vi.fn().mockResolvedValue(mockCursor),
    },
};

const mockDb = {
    put: vi.fn(),
    transaction: vi.fn().mockReturnValue(mockTransaction),
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

        // Re-setup mock cursor for this test to ensure it runs
        mockCursor.continue.mockResolvedValueOnce(null);
        mockTransaction.store.openCursor.mockResolvedValueOnce(mockCursor);

        await syncQueue();

        expect(getAction).toHaveBeenCalledWith('test.action');
        expect(mockAction).toHaveBeenCalledWith({ foo: 'bar' });
        expect(mockCursor.delete).toHaveBeenCalled();
    });

    it('should have a comprehensive action registry', () => {
        // Just verify some key actions are there
        expect(ACTION_REGISTRY['storage.create']).toBeDefined();
        expect(ACTION_REGISTRY['tasks.create']).toBeDefined();
        expect(ACTION_REGISTRY['weather.log']).toBeDefined();
    });
});
