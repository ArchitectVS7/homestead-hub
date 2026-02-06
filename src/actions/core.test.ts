import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dbMock } from '@/test/mocks';
import { createStorageItem, getStorageItems } from '@/actions/storage';
import { createTask, completeTask } from '@/actions/tasks';
import { updateSettings } from '@/actions/settings';

describe('Core Modules', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Storage Actions', () => {
        it('should create an item', async () => {
            dbMock.storageItem.create.mockResolvedValue({ id: '1', name: 'Beans', category: 'pantry', quantity: 5, unit: 'can', lowStockThreshold: 1, expirationDate: null, createdAt: new Date(), updatedAt: new Date(), location: null, notes: null, price: null, calories: null, purchaseDate: null } as any);

            const result = await createStorageItem({ name: 'Beans', category: 'pantry', quantity: 5, unit: 'can' });

            expect(result.success).toBe(true);
            expect(dbMock.storageItem.create).toHaveBeenCalled();
        });

        it('should list items', async () => {
            dbMock.storageItem.findMany.mockResolvedValue([
                { id: '1', name: 'Beans', category: 'pantry', quantity: 5, unit: 'can', lowStockThreshold: 1, expirationDate: null, createdAt: new Date(), updatedAt: new Date(), location: null, notes: null, price: null, calories: null, purchaseDate: null } as any
            ]);

            const items = await getStorageItems();
            expect(items).toHaveLength(1);
            expect(items[0].name).toBe('Beans');
        });
    });

    describe('Task Actions', () => {
        it('should create a task', async () => {
            dbMock.task.create.mockResolvedValue({ id: '1', title: 'Water', priority: 'medium', category: 'garden', recurrenceRule: null, nextDue: null, lastCompleted: null, estimatedMinutes: null, assignedTo: null, notes: null, isActive: true, createdAt: new Date(), updatedAt: new Date(), description: null } as any);

            const result = await createTask({ title: 'Water', priority: 'medium', category: 'garden' });
            expect(result.success).toBe(true);
        });

        it('should complete a task', async () => {
            // Mock task existence
            dbMock.task.findUnique.mockResolvedValue({ id: '1', title: 'Water', priority: 'medium', category: 'garden', recurrenceRule: null, nextDue: null, lastCompleted: null, estimatedMinutes: null, assignedTo: null, notes: null, isActive: true, createdAt: new Date(), updatedAt: new Date(), description: null } as any);

            // Mock update
            dbMock.taskCompletion.create.mockResolvedValue({ id: 'c1', taskId: '1', completedAt: new Date(), completedBy: null, duration: null, notes: null, createdAt: new Date() });
            // Mock update task
            dbMock.task.update.mockResolvedValue({ id: '1' } as any);

            const result = await completeTask('1', { notes: 'Done' });
            expect(result.success).toBe(true);
            expect(dbMock.taskCompletion.create).toHaveBeenCalled();
            expect(dbMock.task.update).toHaveBeenCalled();
        });
    });

    describe('Settings Actions', () => {
        it('should update settings', async () => {
            // Mock findFirst for getSettings()
            dbMock.settings.findFirst.mockResolvedValue({ id: '1', hashedPIN: 'hash', unitPreference: 'metric', hardinessZone: null, zipCode: null, lowStockThreshold: 7, expirationWarningDays: 7, createdAt: new Date() } as any);
            // Mock update
            dbMock.settings.update.mockResolvedValue({ id: '1', hashedPIN: 'hash', unitPreference: 'imperial', hardinessZone: '6b', zipCode: '12345', lowStockThreshold: 7, expirationWarningDays: 7, createdAt: new Date() } as any);

            // Call without ID, as the action derives it from DB singleton
            const result = await updateSettings({ unitPreference: 'imperial', hardinessZone: '6b' });
            expect(result.success).toBe(true);
            expect(dbMock.settings.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: '1' },
                data: expect.objectContaining({ unitPreference: 'imperial', hardinessZone: '6b' })
            }));
        });
    });
});
