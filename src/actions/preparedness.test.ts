import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dbMock } from '@/test/mocks';
import { createChecklist, createChecklistItem, getReadinessScore, toggleItem } from '@/actions/preparedness';

describe('Preparedness Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createChecklist', () => {
        it('should create a checklist', async () => {
            dbMock.checklist.create.mockResolvedValue({
                id: '1',
                name: 'Evacuation',
                category: 'Emergency',
                items: [],
                isTemplate: false
            } as any);

            const result = await createChecklist({
                name: 'Evacuation',
                category: 'Emergency'
            });

            expect(result.success).toBe(true);
            expect(dbMock.checklist.create).toHaveBeenCalled();
        });
    });

    describe('getReadinessScore', () => {
        it('should calculate score based on completed items', async () => {
            // Mock items: 2 completed, 2 incomplete = 50%
            dbMock.checklistItem.findMany.mockResolvedValue([
                { id: '1', isCompleted: true },
                { id: '2', isCompleted: true },
                { id: '3', isCompleted: false },
                { id: '4', isCompleted: false },
            ] as any);

            const score = await getReadinessScore();
            expect(score).toBe(50);
        });

        it('should compute 0 if no items', async () => {
            dbMock.checklistItem.findMany.mockResolvedValue([]);
            const score = await getReadinessScore();
            expect(score).toBe(0);
        });
    });

    describe('Items', () => {
        it('should toggle item', async () => {
            dbMock.checklistItem.update.mockResolvedValue({ id: '1', isCompleted: true } as any);

            const result = await toggleItem('1', true);
            expect(result.success).toBe(true);
            expect(dbMock.checklistItem.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ isCompleted: true })
            }));
        });
    });
});
