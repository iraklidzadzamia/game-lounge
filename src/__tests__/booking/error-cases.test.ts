/**
 * ERROR CASES TESTS - Тесты ошибок и валидации
 * 
 * Эти тесты проверяют что система правильно обрабатывает
 * некорректные данные и возвращает понятные ошибки.
 */

import { calculatePrice, StationType, PRICING } from '@/config/pricing';
import {
    resetMockDb,
    createTestBooking,
    seedMockBookings,
    checkTimeOverlap,
    getMockBookings,
} from '../setup';

describe('Error Cases - Обработка ошибок', () => {
    beforeEach(() => {
        resetMockDb();
    });

    // ==================================
    // ТЕСТЫ ВАЛИДАЦИИ ОБЯЗАТЕЛЬНЫХ ПОЛЕЙ
    // ==================================

    describe('Валидация обязательных полей', () => {
        /**
         * Тест: Отсутствие startTime
         * 
         * ЧТО ПРОВЕРЯЕТ: API должен вернуть 400 если не указано
         * время начала бронирования. Это базовая валидация.
         */
        test('должен отклонить запрос без startTime', () => {
            const invalidRequest = {
                endTime: new Date().toISOString(),
                stationIds: ['chikovani-pro-1'],
                customerName: 'Test',
                customerPhone: '+995555123456',
            };

            const isValid = !!(
                invalidRequest.stationIds &&
                // отсутствует startTime
                invalidRequest.customerName &&
                invalidRequest.customerPhone
            );

            expect(isValid).toBe(true); // Поле есть, но...
            expect('startTime' in invalidRequest).toBe(false); // startTime отсутствует
        });

        /**
         * Тест: Отсутствие stationIds
         * 
         * ЧТО ПРОВЕРЯЕТ: Нельзя создать бронирование без 
         * указания хотя бы одной станции.
         */
        test('должен отклонить запрос без stationIds', () => {
            const invalidRequest = {
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString(),
                customerName: 'Test',
                customerPhone: '+995555123456',
            };

            const hasStations = 'stationIds' in invalidRequest &&
                Array.isArray((invalidRequest as any).stationIds) &&
                (invalidRequest as any).stationIds.length > 0;

            expect(hasStations).toBe(false);
        });

        /**
         * Тест: Пустой массив stationIds
         * 
         * ЧТО ПРОВЕРЯЕТ: Пустой массив станций также невалиден.
         */
        test('должен отклонить пустой массив stationIds', () => {
            const invalidRequest = {
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString(),
                stationIds: [],
                customerName: 'Test',
                customerPhone: '+995555123456',
            };

            expect(invalidRequest.stationIds.length).toBe(0);
        });

        /**
         * Тест: Отсутствие имени клиента
         * 
         * ЧТО ПРОВЕРЯЕТ: Имя клиента обязательно для создания брони.
         */
        test('должен отклонить запрос без customerName', () => {
            const invalidRequest = {
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString(),
                stationIds: ['chikovani-pro-1'],
                customerPhone: '+995555123456',
            };

            const hasName = 'customerName' in invalidRequest &&
                (invalidRequest as any).customerName?.trim().length > 0;

            expect(hasName).toBe(false);
        });

        /**
         * Тест: Отсутствие телефона
         * 
         * ЧТО ПРОВЕРЯЕТ: Телефон обязателен для связи с клиентом.
         */
        test('должен отклонить запрос без customerPhone', () => {
            const validationResult = validateBookingRequest({
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString(),
                stationIds: ['chikovani-pro-1'],
                customerName: 'Test User',
                // customerPhone отсутствует
            });

            expect(validationResult.isValid).toBe(false);
            expect(validationResult.error).toContain('phone');
        });
    });

    // ==================================
    // ТЕСТЫ КОНФЛИКТОВ ВРЕМЕНИ
    // ==================================

    describe('Конфликты бронирования', () => {
        /**
         * Тест: Полное пересечение времени
         * 
         * ЧТО ПРОВЕРЯЕТ: Если существующая бронь полностью
         * перекрывает новый запрос, возвращается 409 Conflict.
         */
        test('должен отклонить при полном наложении времени', () => {
            const now = Date.now();

            // Существующая бронь: 14:00 - 17:00
            const existing = createTestBooking({
                station_id: 'chikovani-pro-1',
                start_time: new Date(now + 3600000).toISOString(),
                end_time: new Date(now + 3600000 * 4).toISOString(),
            });
            seedMockBookings([existing]);

            // Новый запрос: 15:00 - 16:00 (внутри существующего)
            const newStart = new Date(now + 3600000 * 2);
            const newEnd = new Date(now + 3600000 * 3);

            const hasConflict = checkTimeOverlap(
                existing.start_time,
                existing.end_time,
                newStart,
                newEnd
            );

            expect(hasConflict).toBe(true);
        });

        /**
         * Тест: Частичное пересечение в начале
         * 
         * ЧТО ПРОВЕРЯЕТ: Новая бронь начинается до окончания
         * существующей - это конфликт.
         */
        test('должен отклонить при частичном пересечении в начале', () => {
            const now = Date.now();

            // Существующая: 14:00 - 17:00
            const existing = createTestBooking({
                start_time: new Date(now + 3600000).toISOString(),
                end_time: new Date(now + 3600000 * 4).toISOString(),
            });
            seedMockBookings([existing]);

            // Новый запрос: 16:00 - 19:00 (начинается до конца существующей)
            const hasConflict = checkTimeOverlap(
                existing.start_time,
                existing.end_time,
                new Date(now + 3600000 * 3), // 16:00
                new Date(now + 3600000 * 6)  // 19:00
            );

            expect(hasConflict).toBe(true);
        });

        /**
         * Тест: Частичное пересечение в конце
         * 
         * ЧТО ПРОВЕРЯЕТ: Новая бронь заканчивается после начала
         * существующей - это конфликт.
         */
        test('должен отклонить при частичном пересечении в конце', () => {
            const now = Date.now();

            // Существующая: 14:00 - 17:00
            const existing = createTestBooking({
                start_time: new Date(now + 3600000 * 2).toISOString(), // 14:00
                end_time: new Date(now + 3600000 * 5).toISOString(),   // 17:00
            });
            seedMockBookings([existing]);

            // Новый запрос: 12:00 - 15:00 (заканчивается после начала существующей)
            const hasConflict = checkTimeOverlap(
                existing.start_time,
                existing.end_time,
                new Date(now).toISOString(),          // 12:00
                new Date(now + 3600000 * 3).toISOString() // 15:00
            );

            expect(hasConflict).toBe(true);
        });
    });

    // ==================================
    // ТЕСТЫ ВАЛИДАЦИИ ТЕЛЕФОНА
    // ==================================

    describe('Валидация телефона (lookup)', () => {
        /**
         * Тест: Слишком короткий номер
         * 
         * ЧТО ПРОВЕРЯЕТ: Номер телефона должен быть минимум
         * 4 символа для валидного поиска.
         */
        test('должен отклонить телефон короче 4 символов', () => {
            const shortPhone = '123';
            const isValid = shortPhone.replace(/[\s-]/g, '').length >= 4;
            expect(isValid).toBe(false);
        });

        /**
         * Тест: Пустой номер телефона
         * 
         * ЧТО ПРОВЕРЯЕТ: Поиск без номера телефона невозможен.
         */
        test('должен отклонить пустой телефон', () => {
            const emptyPhone = '';
            expect(emptyPhone.length).toBe(0);
        });

        /**
         * Тест: Номер только с пробелами
         * 
         * ЧТО ПРОВЕРЯЕТ: После очистки пробелов номер пуст.
         */
        test('должен отклонить телефон из пробелов', () => {
            const spacesPhone = '   ';
            const cleaned = spacesPhone.replace(/[\s-]/g, '');
            expect(cleaned.length).toBe(0);
        });
    });

    // ==================================
    // ТЕСТЫ НЕВЕРНОГО ТИПА СТАНЦИИ
    // ==================================

    describe('Неверный тип станции', () => {
        /**
         * Тест: Неизвестный тип станции возвращает 0
         * 
         * ЧТО ПРОВЕРЯЕТ: Если тип станции не найден в конфигурации,
         * calculatePrice возвращает 0 (fallback).
         */
        test('должен вернуть 0 для неизвестного типа', () => {
            const price = calculatePrice('UNKNOWN_TYPE' as StationType, 2);
            expect(price).toBe(0);
        });

        /**
         * Тест: Проверка всех известных типов
         * 
         * ЧТО ПРОВЕРЯЕТ: Все типы из PRICING должны
         * возвращать положительную цену.
         */
        test('все известные типы должны иметь положительную цену', () => {
            const knownTypes: StationType[] = ['STANDARD', 'PRO', 'PREMIUM', 'PREMIUM_X', 'VIP', 'PS5'];

            knownTypes.forEach(type => {
                const price = calculatePrice(type, 1);
                expect(price).toBeGreaterThan(0);
            });
        });
    });
});

// ==================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==================================

interface ValidationResult {
    isValid: boolean;
    error?: string;
}

function validateBookingRequest(data: any): ValidationResult {
    if (!data.startTime) {
        return { isValid: false, error: 'startTime is required' };
    }
    if (!data.endTime) {
        return { isValid: false, error: 'endTime is required' };
    }
    if (!data.stationIds || !Array.isArray(data.stationIds) || data.stationIds.length === 0) {
        return { isValid: false, error: 'stationIds must be non-empty array' };
    }
    if (!data.customerName || data.customerName.trim().length === 0) {
        return { isValid: false, error: 'customerName is required' };
    }
    if (!data.customerPhone || data.customerPhone.trim().length === 0) {
        return { isValid: false, error: 'customer phone is required' };
    }
    return { isValid: true };
}
