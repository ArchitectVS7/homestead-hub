import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dbMock } from '@/test/mocks'; // Helper we just defined
import { setupPIN, login } from '@/actions/auth';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';

// Mock Next.js cookies
vi.mock('next/headers', () => ({
    cookies: vi.fn(),
}));

// Mock bcrypt module entirely
vi.mock('bcrypt', () => {
    const mBcrypt = {
        hash: vi.fn().mockResolvedValue('hashed_1234'),
        compare: vi.fn().mockResolvedValue(true),
    };
    return {
        default: mBcrypt,
        ...mBcrypt,
    };
});

describe('Auth Actions', () => {
    const cookieStore = {
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
    };

    beforeEach(() => {
        (cookies as any).mockResolvedValue(cookieStore);
        vi.clearAllMocks();
    });

    describe('setupPIN', () => {
        it('should create a PIN if none exists', async () => {
            // Setup: No existing settings - getSettings will create one without PIN
            dbMock.settings.findFirst.mockResolvedValue(null);
            dbMock.settings.create.mockResolvedValue({ id: '1', hashedPIN: null, unitPreference: 'metric', hardinessZone: null, zipCode: null, latitude: null, longitude: null, weatherAPIKey: null, expirationWarningDays: 7, sessionTTLDays: 7, onboardingCompleted: false, hasStarterData: false, createdAt: new Date(), updatedAt: new Date() });
            dbMock.settings.update.mockResolvedValue({ id: '1', hashedPIN: 'hashed_1234', unitPreference: 'metric', hardinessZone: null, zipCode: null, latitude: null, longitude: null, weatherAPIKey: null, expirationWarningDays: 7, sessionTTLDays: 7, onboardingCompleted: false, hasStarterData: false, createdAt: new Date(), updatedAt: new Date() });

            const result = await setupPIN('1234');

            expect(result.success).toBe(true);
            expect(dbMock.settings.findFirst).toHaveBeenCalled();
            expect(dbMock.settings.create).toHaveBeenCalled();
            expect(dbMock.settings.update).toHaveBeenCalled();
            // Expect hash to be called
            expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
        });

        it('should fail if PIN already exists', async () => {
            // Setup: Existing settings
            dbMock.settings.findFirst.mockResolvedValue({ id: '1', hashedPIN: 'hashed_existing', unitPreference: 'metric', hardinessZone: null, zipCode: null, latitude: null, longitude: null, weatherAPIKey: null, expirationWarningDays: 7, sessionTTLDays: 7, createdAt: new Date(), updatedAt: new Date() } as any);

            const result = await setupPIN('5678');

            expect(result.success).toBe(false);
            expect(result.error).toContain('PIN already set up');
            expect(dbMock.settings.create).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        it('should return success and set cookie for valid PIN', async () => {
            const hashedPin = await bcrypt.hash('1234', 10);
            dbMock.settings.findFirst.mockResolvedValue({ id: '1', hashedPIN: hashedPin, unitPreference: 'metric', hardinessZone: null, zipCode: null, latitude: null, longitude: null, weatherAPIKey: null, expirationWarningDays: 7, sessionTTLDays: 7, createdAt: new Date(), updatedAt: new Date() } as any);

            const result = await login('1234');

            expect(result.success).toBe(true);
            expect(cookieStore.set).toHaveBeenCalledWith(expect.objectContaining({ name: 'homestead-session' }));
        });

        it('should fail for invalid PIN', async () => {
            (bcrypt.compare as any).mockResolvedValueOnce(false);

            const hashedPin = await bcrypt.hash('1234', 10);
            dbMock.settings.findFirst.mockResolvedValue({ id: '1', hashedPIN: hashedPin, unitPreference: 'metric', hardinessZone: null, zipCode: null, latitude: null, longitude: null, weatherAPIKey: null, expirationWarningDays: 7, sessionTTLDays: 7, createdAt: new Date(), updatedAt: new Date() } as any);

            const result = await login('9999');

            expect(result.success).toBe(false);
            expect(cookieStore.set).not.toHaveBeenCalled();
        });
    });
});
