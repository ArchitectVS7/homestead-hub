import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dbMock } from '@/test/mocks';
import { getNotifications, markAsRead, generateNotifications } from '@/actions/notifications';
import * as storageActions from '@/actions/storage';
import * as equipmentActions from '@/actions/equipment';
import * as livestockActions from '@/actions/livestock';

// Mock dependencies
vi.mock('@/actions/storage', () => ({
    getExpiringItems: vi.fn()
}));
vi.mock('@/actions/equipment', () => ({
    getServiceDueEquipment: vi.fn()
}));
vi.mock('@/actions/livestock', () => ({
    getHealthReminders: vi.fn()
}));

describe('Notification Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getNotifications', () => {
        it('should return notifications', async () => {
            dbMock.notification.findMany.mockResolvedValue([
                { id: '1', title: 'Test Alert', isRead: false } as any
            ]);
            const result = await getNotifications();
            expect(result).toHaveLength(1);
        });
    });

    describe('markAsRead', () => {
        it('should update isRead status', async () => {
            dbMock.notification.update.mockResolvedValue({ id: '1', isRead: true } as any);
            await markAsRead('1');
            expect(dbMock.notification.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: '1' },
                data: { isRead: true }
            }));
        });
    });

    describe('generateNotifications', () => {
        it('should create notifications for expiring items', async () => {
            // Setup mocks
            (storageActions.getExpiringItems as any).mockResolvedValue([
                { id: 'item1', name: 'Milk', expirationDate: new Date() }
            ]);
            (equipmentActions.getServiceDueEquipment as any).mockResolvedValue([]);
            (livestockActions.getHealthReminders as any).mockResolvedValue([]);

            // Mock no existing notification
            dbMock.notification.findFirst.mockResolvedValue(null);

            await generateNotifications();

            expect(dbMock.notification.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    title: 'Item Expiring Soon',
                    sourceId: 'item1'
                })
            }));
        });

        it('should not duplicate existing unread notifications', async () => {
            // Setup mocks
            (storageActions.getExpiringItems as any).mockResolvedValue([
                { id: 'item1', name: 'Milk' }
            ]);
            (equipmentActions.getServiceDueEquipment as any).mockResolvedValue([]);
            (livestockActions.getHealthReminders as any).mockResolvedValue([]);

            // Mock EXISTING notification
            dbMock.notification.findFirst.mockResolvedValue({ id: 'notif1', isRead: false } as any);

            await generateNotifications();

            expect(dbMock.notification.create).not.toHaveBeenCalled();
        });
    });
});
