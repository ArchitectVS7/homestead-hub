import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dbMock } from '@/test/mocks';
import { logResource, getResourceSummary, getResourceHistory } from '@/actions/resources';

describe('Resource Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('logResource', () => {
        it('should create a resource log', async () => {
            dbMock.resourceLog.create.mockResolvedValue({
                id: '1',
                type: 'feed',
                action: 'purchase',
                quantity: 50,
                unit: 'lbs',
                date: new Date(),
                cost: 20,
                notes: 'Chicken feed',
                createdAt: new Date(),
                updatedAt: new Date(),
                vendor: null
            } as any);

            const result = await logResource({
                type: 'feed',
                action: 'purchase',
                quantity: 50,
                unit: 'lbs',
                date: new Date(),
                cost: 20,
                notes: 'Chicken feed'
            });

            expect(result.success).toBe(true);
            expect(dbMock.resourceLog.create).toHaveBeenCalled();
        });
    });

    describe('getResourceSummary', () => {
        it('should calculate balance correctly', async () => {
            // Mock logs: Buy 100, Use 30, Adjust +10
            dbMock.resourceLog.findMany.mockResolvedValue([
                { type: 'water', action: 'purchase', quantity: 100, unit: 'gallons', date: new Date('2024-01-01'), cost: 0, notes: null, createdAt: new Date(), vendor: null } as any,
                { type: 'water', action: 'usage', quantity: 30, unit: 'gallons', date: new Date('2024-01-02'), cost: 0, notes: null, createdAt: new Date(), vendor: null } as any,
                { type: 'water', action: 'adjustment', quantity: 10, unit: 'gallons', date: new Date('2024-01-03'), cost: 0, notes: null, createdAt: new Date(), vendor: null } as any,
            ]);

            const summary = await getResourceSummary();

            expect(summary).toHaveLength(1);
            expect(summary[0].type).toBe('water');
            // 100 - 30 + 10 = 80
            expect(summary[0].balance).toBe(80);
            expect(summary[0].unit).toBe('gallons');
        });

        it('should handle multiple resource types', async () => {
            dbMock.resourceLog.findMany.mockResolvedValue([
                { type: 'water', action: 'purchase', quantity: 100, unit: 'gallons', date: new Date(), cost: 0 } as any,
                { type: 'feed', action: 'purchase', quantity: 50, unit: 'lbs', date: new Date(), cost: 0 } as any,
            ]);

            const summary = await getResourceSummary();
            expect(summary).toHaveLength(2);
            const water = summary.find(s => s.type === 'water');
            const feed = summary.find(s => s.type === 'feed');

            expect(water?.balance).toBe(100);
            expect(feed?.balance).toBe(50);
        });
    });

    describe('getResourceHistory', () => {
        it('should list logs with filters', async () => {
            dbMock.resourceLog.findMany.mockResolvedValue([
                { type: 'water', action: 'purchase' } as any
            ]);

            const logs = await getResourceHistory({ type: 'water' });
            expect(logs).toHaveLength(1);
            expect(dbMock.resourceLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { type: 'water' }
            }));
        });
    });
});
