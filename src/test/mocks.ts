
import { PrismaClient } from '@prisma/client'
import { beforeEach, vi } from 'vitest'
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended'

// 1. Mock the specific module path
vi.mock('@/lib/db', () => ({
    __esModule: true,
    db: mockDeep<PrismaClient>(),
}))

import { db } from '@/lib/db'

// 2. Export the mocked object with the correct type for use in tests
export const dbMock = db as unknown as DeepMockProxy<PrismaClient>

// 3. Reset between tests
beforeEach(() => {
    vi.clearAllMocks()
})
