import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dbMock } from '@/test/mocks';
import { createCrop, getPlantings, createPlanting, logHarvest } from '@/actions/garden';
import { createEquipment, logMaintenance, getServiceDueEquipment } from '@/actions/equipment';
import { createAnimal, addHealthRecord } from '@/actions/livestock';

describe('Phase 2 Modules', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Garden Module', () => {
        it('should create a crop', async () => {
            dbMock.crop.create.mockResolvedValue({ id: '1', name: 'Tomato', variety: 'Roma', daysToMaturity: 80, createdAt: new Date() } as any);
            const result = await createCrop({ name: 'Tomato', variety: 'Roma', daysToMaturity: 80 });
            expect(result.success).toBe(true);
        });

        it('should auto-calc harvest date', async () => {
            dbMock.crop.findUnique.mockResolvedValue({ id: '1', daysToMaturity: 80 } as any);
            dbMock.planting.create.mockResolvedValue({ id: 'p1' } as any);

            const plantDate = new Date('2024-05-01');
            const result = await createPlanting({ cropId: '1', location: 'Bed 1', plantDate, quantity: 1 });

            expect(result.success).toBe(true);
            const createCall = dbMock.planting.create.mock.calls[0][0];
            // Check if expectedHarvest was calculated (approx 80 days later)
            expect(createCall.data.expectedHarvest).toBeDefined();
        });
    });

    describe('Equipment Module', () => {
        it('should identify service due items', async () => {
            // Mock equipment list
            dbMock.equipment.findMany.mockResolvedValue([
                { id: '1', name: 'Tractor', status: 'operational', serviceIntervalHours: 100, lastServiceHours: 100, currentHours: 250, serviceIntervalDays: null, lastServiceDate: null } as any, // 150hr diff > 100 -> Due
                { id: '2', name: 'Mower', status: 'operational', serviceIntervalHours: 50, lastServiceHours: 40, currentHours: 60, serviceIntervalDays: null, lastServiceDate: null } as any, // 20hr diff < 50 -> OK
            ]);

            const due = await getServiceDueEquipment();
            expect(due).toHaveLength(1);
            expect(due[0].name).toBe('Tractor');
        });

        it('should log maintenance and update status', async () => {
            dbMock.equipment.findUnique.mockResolvedValue({ id: '1', status: 'needs-service', currentHours: 200 } as any);
            dbMock.maintenanceRecord.create.mockResolvedValue({ id: 'm1' } as any);
            dbMock.equipment.update.mockResolvedValue({ id: '1' } as any);

            const result = await logMaintenance('1', { type: 'routine', description: 'Oil change', date: new Date(), cost: 50, hoursAtService: 200 });

            expect(result.success).toBe(true);
            // Check if status was reset to operational
            const updateCall = dbMock.equipment.update.mock.calls[0][0];
            expect(updateCall.data.status).toBe('operational');
        });
    });

    describe('Livestock Module', () => {
        it('should create animal', async () => {
            dbMock.animal.create.mockResolvedValue({ id: 'a1' } as any);
            const result = await createAnimal({ name: 'Bessie', type: 'cow', sex: 'female', status: 'active', isNeutered: false });
            expect(result.success).toBe(true);
        });
    });
});
