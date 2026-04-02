import { describe, it, expect } from 'vitest';
import {
    detectAndResolveConflicts,
    getResourceKey,
    hasConflicts,
    QueuedMutation,
} from '@/lib/sync-conflict-resolver';

// Helper
function mutation(action: string, data: any, timestamp: number): QueuedMutation {
    return { action, data, timestamp };
}

describe('getResourceKey', () => {
    it('derives key from data.id for standard actions', () => {
        expect(getResourceKey(mutation('storage.update', { id: 42 }, 1))).toBe('storage:42');
        expect(getResourceKey(mutation('tasks.complete', { id: 7 }, 1))).toBe('tasks:7');
    });

    it('handles alternative ID fields', () => {
        expect(getResourceKey(mutation('equipment.logMaintenance', { equipmentId: 3 }, 1))).toBe('equipment:3');
        expect(getResourceKey(mutation('livestock.addhealthrecord', { animalId: 5 }, 1))).toBe('livestock:5');
        expect(getResourceKey(mutation('garden.logHarvest', { plantingId: 9 }, 1))).toBe('garden:9');
    });

    it('returns null for create mutations with no ID', () => {
        expect(getResourceKey(mutation('storage.create', { name: 'Apples' }, 1))).toBeNull();
        expect(getResourceKey(mutation('tasks.create', { title: 'Feed chickens' }, 1))).toBeNull();
    });

    it('returns null for mutations with no data', () => {
        expect(getResourceKey(mutation('notifications.markallread', null, 1))).toBeNull();
    });
});

describe('hasConflicts', () => {
    it('returns false for an empty list', () => {
        expect(hasConflicts([])).toBe(false);
    });

    it('returns false when all mutations target different resources', () => {
        const mutations = [
            mutation('storage.update', { id: 1 }, 100),
            mutation('storage.update', { id: 2 }, 200),
            mutation('tasks.update', { id: 1 }, 300),
        ];
        expect(hasConflicts(mutations)).toBe(false);
    });

    it('returns true when two mutations target the same resource', () => {
        const mutations = [
            mutation('storage.update', { id: 1 }, 100),
            mutation('storage.update', { id: 1 }, 200),
        ];
        expect(hasConflicts(mutations)).toBe(true);
    });

    it('ignores create mutations (no ID) — they cannot conflict', () => {
        const mutations = [
            mutation('storage.create', { name: 'Rice' }, 100),
            mutation('storage.create', { name: 'Beans' }, 200),
        ];
        expect(hasConflicts(mutations)).toBe(false);
    });
});

describe('detectAndResolveConflicts — no conflicts', () => {
    it('returns all mutations unchanged when there are no conflicts', () => {
        const mutations = [
            mutation('storage.update', { id: 1 }, 100),
            mutation('tasks.update', { id: 2 }, 200),
            mutation('storage.create', { name: 'Honey' }, 300),
        ];
        const { resolved, conflicts } = detectAndResolveConflicts(mutations);
        expect(resolved).toHaveLength(3);
        expect(conflicts).toHaveLength(0);
    });

    it('preserves chronological order in output', () => {
        const mutations = [
            mutation('storage.update', { id: 3 }, 300),
            mutation('storage.update', { id: 1 }, 100),
            mutation('storage.update', { id: 2 }, 200),
        ];
        const { resolved } = detectAndResolveConflicts(mutations);
        expect(resolved.map((m) => m.timestamp)).toEqual([100, 200, 300]);
    });
});

describe('detectAndResolveConflicts — lastWriteWins (default)', () => {
    it('keeps the most recent mutation when two target the same resource', () => {
        const mutations = [
            mutation('storage.update', { id: 1, quantity: 10 }, 100),
            mutation('storage.update', { id: 1, quantity: 20 }, 200),
        ];
        const { resolved, conflicts } = detectAndResolveConflicts(mutations);
        expect(resolved).toHaveLength(1);
        expect(resolved[0].data.quantity).toBe(20);
        expect(conflicts).toHaveLength(1);
        expect(conflicts[0].keptTimestamp).toBe(200);
        expect(conflicts[0].discardedTimestamps).toEqual([100]);
        expect(conflicts[0].strategy).toBe('lastWriteWins');
    });

    it('handles three-way conflicts correctly', () => {
        const mutations = [
            mutation('tasks.update', { id: 5, title: 'A' }, 100),
            mutation('tasks.update', { id: 5, title: 'B' }, 200),
            mutation('tasks.update', { id: 5, title: 'C' }, 300),
        ];
        const { resolved, conflicts } = detectAndResolveConflicts(mutations);
        expect(resolved).toHaveLength(1);
        expect(resolved[0].data.title).toBe('C');
        expect(conflicts[0].discardedTimestamps).toHaveLength(2);
        expect(conflicts[0].discardedTimestamps).toContain(100);
        expect(conflicts[0].discardedTimestamps).toContain(200);
    });

    it('resolves conflicts across different resource types independently', () => {
        const mutations = [
            mutation('storage.update', { id: 1 }, 100),
            mutation('tasks.update', { id: 1 }, 110),   // different resource type, same numeric ID
            mutation('storage.update', { id: 1 }, 200),
        ];
        const { resolved, conflicts } = detectAndResolveConflicts(mutations);
        // tasks:1 and storage:1 are separate keys — only storage has a conflict
        expect(resolved).toHaveLength(2);
        expect(conflicts).toHaveLength(1);
        expect(conflicts[0].resourceKey).toBe('storage:1');
    });
});

describe('detectAndResolveConflicts — firstWriteWins', () => {
    it('keeps the earliest mutation', () => {
        const mutations = [
            mutation('storage.update', { id: 1, quantity: 10 }, 100),
            mutation('storage.update', { id: 1, quantity: 20 }, 200),
        ];
        const { resolved, conflicts } = detectAndResolveConflicts(mutations, 'firstWriteWins');
        expect(resolved[0].data.quantity).toBe(10);
        expect(conflicts[0].keptTimestamp).toBe(100);
        expect(conflicts[0].discardedTimestamps).toEqual([200]);
        expect(conflicts[0].strategy).toBe('firstWriteWins');
    });
});

describe('detectAndResolveConflicts — serverWins', () => {
    it('discards all local mutations for a conflicted resource', () => {
        const mutations = [
            mutation('storage.update', { id: 1 }, 100),
            mutation('storage.update', { id: 1 }, 200),
        ];
        const { resolved, conflicts } = detectAndResolveConflicts(mutations, 'serverWins');
        expect(resolved).toHaveLength(0);
        expect(conflicts).toHaveLength(1);
        expect(conflicts[0].keptTimestamp).toBe(-1);
        expect(conflicts[0].discardedTimestamps).toHaveLength(2);
    });

    it('passes through non-conflicting mutations untouched', () => {
        const mutations = [
            mutation('storage.update', { id: 1 }, 100),
            mutation('storage.update', { id: 1 }, 200),
            mutation('tasks.create', { title: 'Water garden' }, 150),
        ];
        const { resolved } = detectAndResolveConflicts(mutations, 'serverWins');
        expect(resolved).toHaveLength(1);
        expect(resolved[0].action).toBe('tasks.create');
    });
});

describe('detectAndResolveConflicts — mixed create and update', () => {
    it('creates pass through without conflict-checking', () => {
        const mutations = [
            mutation('storage.create', { name: 'Rice' }, 100),
            mutation('storage.create', { name: 'Beans' }, 200),
            mutation('storage.update', { id: 5, quantity: 3 }, 300),
        ];
        const { resolved, conflicts } = detectAndResolveConflicts(mutations);
        expect(resolved).toHaveLength(3);
        expect(conflicts).toHaveLength(0);
    });
});

describe('detectAndResolveConflicts — empty and single-item inputs', () => {
    it('handles empty array', () => {
        const { resolved, conflicts } = detectAndResolveConflicts([]);
        expect(resolved).toHaveLength(0);
        expect(conflicts).toHaveLength(0);
    });

    it('handles single mutation without error', () => {
        const { resolved, conflicts } = detectAndResolveConflicts([
            mutation('tasks.update', { id: 1 }, 100),
        ]);
        expect(resolved).toHaveLength(1);
        expect(conflicts).toHaveLength(0);
    });
});
