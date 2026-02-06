import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dbMock } from '@/test/mocks';
import { logWeather, getLatestWeather, getWeatherHistory } from '@/actions/weather';

describe('Weather Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('logWeather', () => {
        it('should create a weather snapshot', async () => {
            dbMock.weatherSnapshot.create.mockResolvedValue({
                id: '1',
                timestamp: new Date(),
                temperature: 72,
                humidity: 45,
                conditions: 'Sunny',
                precipitation: 0,
                windSpeed: 5,
                notes: null,
                createdAt: new Date(),
                feelsLike: null,
                windDirection: null,
                pressure: null,
                uvIndex: null,
                source: null
            } as any);

            const result = await logWeather({
                temperature: 72,
                humidity: 45,
                conditions: 'Sunny',
                precipitation: 0,
                windSpeed: 5
            });

            expect(result.success).toBe(true);
            expect(dbMock.weatherSnapshot.create).toHaveBeenCalled();
        });
    });

    describe('getLatestWeather', () => {
        it('should return the latest snapshot', async () => {
            const now = new Date();
            dbMock.weatherSnapshot.findFirst.mockResolvedValue({
                id: '1',
                timestamp: now,
                temperature: 70,
                conditions: 'Clear'
            } as any);

            const result = await getLatestWeather();
            expect(result).not.toBeNull();
            expect(result?.temperature).toBe(70);
        });
    });
});
