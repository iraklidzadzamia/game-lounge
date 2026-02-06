/**
 * Test Setup - Mock Supabase Client
 * 
 * Этот файл настраивает моки для тестирования без реальной БД.
 * Mock функции позволяют симулировать различные сценарии.
 */

import { jest } from '@jest/globals';

// Типы для моков
export interface MockBooking {
    id: string;
    station_id: string;
    start_time: string;
    end_time: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    total_price: number;
    status: string;
    branch_id: string;
    created_at: string;
}

export interface MockStation {
    id: string;
    name: string;
    type: 'PREMIUM' | 'PRO' | 'VIP' | 'STANDARD' | 'PREMIUM_X' | 'PS5';
    floor: number;
    zone?: string;
    status: string;
    branch_id: string;
}

// In-memory хранилище для симуляции БД
let mockBookings: MockBooking[] = [];
let mockStations: MockStation[] = [
    { id: 'chikovani-vip-1', name: 'VIP 1', type: 'VIP', floor: 1, branch_id: 'chikovani', status: 'ACTIVE' },
    { id: 'chikovani-vip-2', name: 'VIP 2', type: 'VIP', floor: 1, branch_id: 'chikovani', status: 'ACTIVE' },
    { id: 'chikovani-pro-1', name: 'PRO 1', type: 'PRO', floor: 2, branch_id: 'chikovani', status: 'ACTIVE' },
    { id: 'chikovani-pro-2', name: 'PRO 2', type: 'PRO', floor: 2, branch_id: 'chikovani', status: 'ACTIVE' },
    { id: 'chikovani-prem-1', name: 'PREM 1', type: 'PREMIUM', floor: 2, branch_id: 'chikovani', status: 'ACTIVE' },
];

// Сброс состояния между тестами
export const resetMockDb = () => {
    mockBookings = [];
};

export const seedMockBookings = (bookings: MockBooking[]) => {
    mockBookings = bookings;
};

export const getMockBookings = () => mockBookings;
export const getMockStations = () => mockStations;

// Mock Supabase клиент
export const createMockSupabaseClient = () => {
    const mockQuery = {
        data: null as any,
        error: null as any,

        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockImplementation((records: any[]) => {
            const inserted = records.map(r => ({
                ...r,
                id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                created_at: new Date().toISOString(),
            }));
            mockBookings.push(...inserted);
            mockQuery.data = inserted;
            return mockQuery;
        }),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        gt: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
            mockQuery.data = mockQuery.data?.[0] || null;
            return mockQuery;
        }),
        order: jest.fn().mockReturnThis(),
    };

    return {
        from: jest.fn((table: string) => {
            // Возвращаем соответствующие данные в зависимости от таблицы
            if (table === 'bookings') {
                mockQuery.data = mockBookings;
            } else if (table === 'stations') {
                mockQuery.data = mockStations;
            }
            return mockQuery;
        }),
    };
};

// Хелперы для тестов
export const createTestBooking = (overrides: Partial<MockBooking> = {}): MockBooking => ({
    id: `test-booking-${Date.now()}`,
    station_id: 'chikovani-pro-1',
    start_time: new Date(Date.now() + 3600000).toISOString(), // +1 час
    end_time: new Date(Date.now() + 7200000).toISOString(), // +2 часа
    customer_name: 'Test User',
    customer_phone: '+995555123456',
    customer_email: 'test@example.com',
    total_price: 16,
    status: 'CONFIRMED',
    branch_id: 'chikovani',
    created_at: new Date().toISOString(),
    ...overrides,
});

export const createTestRequest = (body: any): Request => {
    return new Request('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
};

// Утилита для проверки пересечения временных интервалов
export const checkTimeOverlap = (
    start1: Date | string,
    end1: Date | string,
    start2: Date | string,
    end2: Date | string
): boolean => {
    const s1 = new Date(start1).getTime();
    const e1 = new Date(end1).getTime();
    const s2 = new Date(start2).getTime();
    const e2 = new Date(end2).getTime();

    return s1 < e2 && e1 > s2;
};
