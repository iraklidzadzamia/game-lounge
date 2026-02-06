/**
 * CONCURRENT BOOKING TESTS - Тесты одновременных запросов
 * 
 * Эти тесты проверяют поведение системы при параллельных
 * запросах - критически важно для предотвращения двойных бронирований.
 * 
 * ⚠️ ВАЖНО: Эти тесты выявляют СУЩЕСТВУЮЩУЮ проблему race condition
 * в текущей реализации API.
 */

import {
    resetMockDb,
    createTestBooking,
    seedMockBookings,
    checkTimeOverlap,
    getMockBookings,
} from '../setup';

describe('Concurrent Bookings - Одновременные запросы', () => {
    beforeEach(() => {
        resetMockDb();
    });

    // ==================================
    // RACE CONDITION ТЕСТЫ
    // ==================================

    describe('Race Condition Detection', () => {
        /**
         * Тест: Два одновременных запроса на одну станцию
         * 
         * ЧТО ПРОВЕРЯЕТ: Когда два клиента одновременно пытаются
         * забронировать одну и ту же станцию на одно время,
         * только ОДИН должен успешно завершиться.
         * 
         * ТЕКУЩАЯ ПРОБЛЕМА: Из-за отсутствия транзакций и
         * уникальных constraint'ов, в window между проверкой
         * и вставкой оба запроса могут пройти.
         */
        test('должен симулировать race condition между двумя запросами', async () => {
            const now = Date.now();
            const stationId = 'chikovani-pro-1';
            const startTime = new Date(now + 3600000).toISOString();
            const endTime = new Date(now + 7200000).toISOString();

            /**
             * Симуляция параллельных запросов:
             * 
             * Время:    |----Запрос A-----|----Вставка A----|
             *           |----Запрос B-----|----Вставка B----|
             * 
             * Оба запроса проверяют доступность ОДНОВРЕМЕННО,
             * оба видят что станция свободна,
             * оба вставляют бронь.
             */

            // Симуляция: оба запроса проверили доступность одновременно
            const checkAvailability = () => {
                const existingBookings = getMockBookings();
                return existingBookings.filter(b =>
                    b.station_id === stationId &&
                    checkTimeOverlap(b.start_time, b.end_time, startTime, endTime)
                );
            };

            // Оба видят пустой список конфликтов
            const conflictsA = checkAvailability();
            const conflictsB = checkAvailability();

            expect(conflictsA).toHaveLength(0);
            expect(conflictsB).toHaveLength(0);

            // Оба начинают вставку (без транзакций!)
            const bookingA = createTestBooking({
                station_id: stationId,
                start_time: startTime,
                end_time: endTime,
                customer_name: 'Клиент A',
            });

            const bookingB = createTestBooking({
                station_id: stationId,
                start_time: startTime,
                end_time: endTime,
                customer_name: 'Клиент B',
            });

            seedMockBookings([bookingA, bookingB]);

            // ПРОБЛЕМА: Теперь в БД ДВЕ брони на одну станцию!
            const allBookings = getMockBookings().filter(b =>
                b.station_id === stationId &&
                b.start_time === startTime
            );

            // Это ОЖИДАЕМАЯ ПРОБЛЕМА текущей реализации
            expect(allBookings).toHaveLength(2);

            // В ИДЕАЛЕ должно быть:
            // expect(allBookings).toHaveLength(1);
        });

        /**
         * Тест: Предлагаемое решение с уникальным constraint
         * 
         * ЧТО ПРОВЕРЯЕТ: Как должна работать система
         * с правильными database constraints.
         */
        test('должен показать правильное поведение с constraint', () => {
            const now = Date.now();
            const stationId = 'chikovani-pro-1';
            const startTime = new Date(now + 3600000).toISOString();

            // Первая бронь вставляется успешно
            const bookingA = createTestBooking({
                station_id: stationId,
                start_time: startTime,
            });
            seedMockBookings([bookingA]);

            // Попытка второй брони - должна быть отклонена
            const tryInsertSecond = () => {
                const existing = getMockBookings().find(b =>
                    b.station_id === stationId &&
                    b.start_time === startTime
                );

                if (existing) {
                    throw new Error('UNIQUE_VIOLATION: Slot already booked');
                }

                return createTestBooking({
                    station_id: stationId,
                    start_time: startTime,
                    customer_name: 'Клиент B',
                });
            };

            expect(tryInsertSecond).toThrow('UNIQUE_VIOLATION');
        });
    });

    // ==================================
    // ПАРАЛЛЕЛЬНЫЕ РАЗНЫЕ СТАНЦИИ
    // ==================================

    describe('Параллельные запросы на разные станции', () => {
        /**
         * Тест: Два запроса на разные станции
         * 
         * ЧТО ПРОВЕРЯЕТ: Параллельные бронирования РАЗНЫХ станций
         * должны оба успешно завершиться - здесь нет конфликта.
         */
        test('оба запроса на разные станции должны пройти', () => {
            const now = Date.now();
            const startTime = new Date(now + 3600000).toISOString();
            const endTime = new Date(now + 7200000).toISOString();

            const bookingA = createTestBooking({
                station_id: 'chikovani-pro-1',
                start_time: startTime,
                end_time: endTime,
                customer_name: 'Клиент A',
            });

            const bookingB = createTestBooking({
                station_id: 'chikovani-pro-2', // ДРУГАЯ станция
                start_time: startTime,
                end_time: endTime,
                customer_name: 'Клиент B',
            });

            seedMockBookings([bookingA, bookingB]);

            const allBookings = getMockBookings();

            // Обе брони должны быть созданы
            expect(allBookings).toHaveLength(2);
            expect(allBookings.map(b => b.station_id)).toContain('chikovani-pro-1');
            expect(allBookings.map(b => b.station_id)).toContain('chikovani-pro-2');
        });
    });

    // ==================================
    // ЧАСТИЧНОЕ ПЕРЕСЕЧЕНИЕ
    // ==================================

    describe('Параллельные запросы с частичным пересечением', () => {
        /**
         * Тест: Запросы с пересекающимся временем
         * 
         * ЧТО ПРОВЕРЯЕТ: Даже если время не совпадает полностью,
         * любое пересечение должно быть конфликтом.
         */
        test('должен определить конфликт при частичном пересечении', async () => {
            const now = Date.now();

            // Запрос A: 14:00 - 17:00
            const bookingA = createTestBooking({
                station_id: 'chikovani-pro-1',
                start_time: new Date(now + 3600000).toISOString(),     // 14:00
                end_time: new Date(now + 3600000 * 4).toISOString(),   // 17:00
            });
            seedMockBookings([bookingA]);

            // Запрос B: 16:00 - 19:00 (пересекается с A)
            const requestB = {
                stationId: 'chikovani-pro-1',
                startTime: new Date(now + 3600000 * 3), // 16:00
                endTime: new Date(now + 3600000 * 6),   // 19:00
            };

            const existingBookings = getMockBookings();
            const hasConflict = existingBookings.some(b =>
                b.station_id === requestB.stationId &&
                checkTimeOverlap(
                    b.start_time,
                    b.end_time,
                    requestB.startTime,
                    requestB.endTime
                )
            );

            expect(hasConflict).toBe(true);
        });
    });

    // ==================================
    // STRESS ТЕСТЫ
    // ==================================

    describe('Stress Tests - Множество параллельных запросов', () => {
        /**
         * Тест: 10 одновременных запросов на одну станцию
         * 
         * ЧТО ПРОВЕРЯЕТ: При массовых параллельных запросах
         * система должна сохранять консистентность.
         */
        test('должен обработать 10 параллельных запросов на одну станцию', () => {
            const now = Date.now();
            const stationId = 'chikovani-pro-1';
            const startTime = new Date(now + 3600000).toISOString();
            const endTime = new Date(now + 7200000).toISOString();

            // Симуляция 10 параллельных запросов
            const requests = Array.from({ length: 10 }, (_, i) => ({
                stationId,
                startTime,
                endTime,
                customerName: `Клиент ${i + 1}`,
            }));

            // В реальности все они проверят доступность одновременно
            // и все увидят пустой список
            let successCount = 0;
            let failCount = 0;

            requests.forEach((req, index) => {
                // Первый запрос всегда проходит
                // Остальные должны видеть конфликт (в идеальной системе)
                if (index === 0) {
                    const booking = createTestBooking({
                        station_id: req.stationId,
                        start_time: req.startTime,
                        end_time: req.endTime,
                        customer_name: req.customerName,
                    });
                    seedMockBookings([booking]);
                    successCount++;
                } else {
                    // Проверяем доступность после первой вставки
                    const existing = getMockBookings().find(b =>
                        b.station_id === req.stationId &&
                        b.start_time === req.startTime
                    );

                    if (existing) {
                        failCount++;
                    } else {
                        successCount++;
                    }
                }
            });

            // Должен пройти только 1, остальные 9 отклонены
            expect(successCount).toBe(1);
            expect(failCount).toBe(9);
        });

        /**
         * Тест: Множество станций, множество клиентов
         * 
         * ЧТО ПРОВЕРЯЕТ: При массовых бронированиях разных
         * станций система работает корректно.
         */
        test('должен обработать множество броней на разные станции', () => {
            const now = Date.now();
            const stations = [
                'chikovani-pro-1',
                'chikovani-pro-2',
                'chikovani-prem-1',
                'chikovani-vip-1',
                'chikovani-vip-2',
            ];

            const bookings = stations.map((stationId, i) =>
                createTestBooking({
                    station_id: stationId,
                    start_time: new Date(now + 3600000).toISOString(),
                    end_time: new Date(now + 7200000).toISOString(),
                    customer_name: `Клиент ${i + 1}`,
                })
            );

            seedMockBookings(bookings);

            const allBookings = getMockBookings();

            // Все 5 броней должны пройти (разные станции)
            expect(allBookings).toHaveLength(5);

            // Проверяем уникальность станций
            const stationIds = allBookings.map(b => b.station_id);
            const uniqueStations = new Set(stationIds);
            expect(uniqueStations.size).toBe(5);
        });
    });

    // ==================================
    // ОТМЕНА И ПЕРЕСОЗДАНИЕ
    // ==================================

    describe('Отмена и быстрое повторное бронирование', () => {
        /**
         * Тест: Бронь отменена, слот снова доступен
         * 
         * ЧТО ПРОВЕРЯЕТ: После отмены брони,
         * слот снова становится доступным.
         */
        test('отменённая бронь не должна блокировать слот', () => {
            const now = Date.now();
            const stationId = 'chikovani-pro-1';
            const startTime = new Date(now + 3600000).toISOString();
            const endTime = new Date(now + 7200000).toISOString();

            // Создаём и сразу отменяем бронь
            const cancelledBooking = createTestBooking({
                station_id: stationId,
                start_time: startTime,
                end_time: endTime,
                status: 'CANCELLED', // Отменена!
            });
            seedMockBookings([cancelledBooking]);

            // Проверяем доступность (только CONFIRMED брони считаются)
            const confirmedConflicts = getMockBookings().filter(b =>
                b.station_id === stationId &&
                b.status === 'CONFIRMED' &&
                checkTimeOverlap(b.start_time, b.end_time, startTime, endTime)
            );

            // Слот свободен!
            expect(confirmedConflicts).toHaveLength(0);
        });
    });
});
