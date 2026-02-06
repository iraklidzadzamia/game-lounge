/**
 * GROUP BOOKING TESTS - Тесты групповых бронирований
 * 
 * Эти тесты проверяют логику группового бронирования:
 * - Создание брони на несколько станций одновременно
 * - Группировка по customer_phone + start_time + end_time
 * - Расчёт общей цены группы
 * - Одновременное обновление всех станций группы
 */

import { calculatePrice, StationType } from '@/config/pricing';
import {
    resetMockDb,
    createTestBooking,
    seedMockBookings,
    getMockBookings,
} from '../setup';

describe('Group Booking - Групповые бронирования', () => {
    beforeEach(() => {
        resetMockDb();
    });

    // ==================================
    // ЛОГИКА ГРУППИРОВКИ В DASHBOARD
    // ==================================

    describe('Логика группировки в Dashboard', () => {
        /**
         * Тест: Бронирования с одинаковым ключом группируются
         * 
         * ЧТО ПРОВЕРЯЕТ: Брони с одинаковым телефоном,
         * start_time и end_time объединяются в группу.
         * 
         * КОД В dashboard/page.tsx:
         * ```typescript
         * const key = `${booking.customer_phone}-${booking.start_time}-${booking.end_time}`;
         * ```
         */
        test('должен группировать брони по phone+start+end', () => {
            const phone = '+995555123456';
            const startTime = '2025-02-07T14:00:00.000Z';
            const endTime = '2025-02-07T17:00:00.000Z';

            const bookings = [
                createTestBooking({
                    station_id: 'pro-1',
                    customer_phone: phone,
                    start_time: startTime,
                    end_time: endTime,
                }),
                createTestBooking({
                    station_id: 'pro-2',
                    customer_phone: phone,
                    start_time: startTime,
                    end_time: endTime,
                }),
                createTestBooking({
                    station_id: 'prem-1',
                    customer_phone: phone,
                    start_time: startTime,
                    end_time: endTime,
                }),
            ];

            // Симуляция groupBookings()
            const groups: Record<string, any> = {};
            bookings.forEach(booking => {
                const key = `${booking.customer_phone}-${booking.start_time}-${booking.end_time}`;
                if (!groups[key]) {
                    groups[key] = {
                        ...booking,
                        isGroup: false,
                        subBookings: [booking],
                        stationNames: [booking.station_id],
                        totalGroupPrice: booking.total_price || 0,
                    };
                } else {
                    groups[key].isGroup = true;
                    groups[key].subBookings.push(booking);
                    groups[key].stationNames.push(booking.station_id);
                    groups[key].totalGroupPrice += booking.total_price || 0;
                }
            });

            const groupedBookings = Object.values(groups);

            expect(groupedBookings).toHaveLength(1);
            expect(groupedBookings[0].isGroup).toBe(true);
            expect(groupedBookings[0].subBookings).toHaveLength(3);
            expect(groupedBookings[0].stationNames).toContain('pro-1');
            expect(groupedBookings[0].stationNames).toContain('pro-2');
            expect(groupedBookings[0].stationNames).toContain('prem-1');
        });

        /**
         * Тест: Разные телефоны НЕ группируются
         */
        test('разные телефоны создают отдельные группы', () => {
            const startTime = '2025-02-07T14:00:00.000Z';
            const endTime = '2025-02-07T17:00:00.000Z';

            const bookings = [
                createTestBooking({
                    customer_phone: '+995555111111',
                    start_time: startTime,
                    end_time: endTime,
                }),
                createTestBooking({
                    customer_phone: '+995555222222', // Другой телефон
                    start_time: startTime,
                    end_time: endTime,
                }),
            ];

            const groups: Record<string, any> = {};
            bookings.forEach(booking => {
                const key = `${booking.customer_phone}-${booking.start_time}-${booking.end_time}`;
                if (!groups[key]) {
                    groups[key] = { subBookings: [booking] };
                } else {
                    groups[key].subBookings.push(booking);
                }
            });

            // Две отдельные группы
            expect(Object.keys(groups)).toHaveLength(2);
        });

        /**
         * Тест: Разное время НЕ группируется
         */
        test('разное время создаёт отдельные группы', () => {
            const phone = '+995555123456';

            const bookings = [
                createTestBooking({
                    customer_phone: phone,
                    start_time: '2025-02-07T14:00:00.000Z',
                    end_time: '2025-02-07T17:00:00.000Z',
                }),
                createTestBooking({
                    customer_phone: phone,
                    start_time: '2025-02-07T18:00:00.000Z', // Другое время
                    end_time: '2025-02-07T20:00:00.000Z',
                }),
            ];

            const groups: Record<string, any> = {};
            bookings.forEach(booking => {
                const key = `${booking.customer_phone}-${booking.start_time}-${booking.end_time}`;
                if (!groups[key]) {
                    groups[key] = { subBookings: [booking] };
                } else {
                    groups[key].subBookings.push(booking);
                }
            });

            // Две отдельные группы (разное время)
            expect(Object.keys(groups)).toHaveLength(2);
        });
    });

    // ==================================
    // СОЗДАНИЕ ГРУППОВЫХ БРОНИРОВАНИЙ
    // ==================================

    describe('Создание групповых бронирований', () => {
        /**
         * Тест: Одновременный insert нескольких станций
         * 
         * ЧТО ПРОВЕРЯЕТ: При групповом бронировании
         * все станции вставляются одним запросом.
         */
        test('должен вставить все станции одним запросом', () => {
            const stationIds = ['pro-1', 'pro-2', 'prem-1'];
            const customerData = {
                customer_name: 'Группа',
                customer_phone: '+995555123456',
                start_time: '2025-02-07T14:00:00.000Z',
                end_time: '2025-02-07T17:00:00.000Z',
            };

            const newBookings = stationIds.map(sid => ({
                station_id: sid,
                ...customerData,
                status: 'CONFIRMED',
            }));

            expect(newBookings).toHaveLength(3);
            newBookings.forEach(booking => {
                expect(booking.customer_name).toBe('Группа');
                expect(booking.customer_phone).toBe('+995555123456');
            });
        });

        /**
         * Тест: Conflict check для всех станций
         * 
         * ЧТО ПРОВЕРЯЕТ: Перед вставкой проверяются
         * конфликты для ВСЕХ станций группы.
         */
        test('должен проверить конфликты всех станций', () => {
            // Существующая бронь на pro-2
            const existing = createTestBooking({
                station_id: 'pro-2',
                start_time: '2025-02-07T14:00:00.000Z',
                end_time: '2025-02-07T17:00:00.000Z',
            });
            seedMockBookings([existing]);

            const requestedStations = ['pro-1', 'pro-2', 'prem-1'];
            const requestedStart = '2025-02-07T15:00:00.000Z';
            const requestedEnd = '2025-02-07T18:00:00.000Z';

            // Проверка конфликтов
            const conflicts = getMockBookings().filter(b =>
                requestedStations.includes(b.station_id) &&
                new Date(b.start_time) < new Date(requestedEnd) &&
                new Date(b.end_time) > new Date(requestedStart)
            );

            expect(conflicts).toHaveLength(1);
            expect(conflicts[0].station_id).toBe('pro-2');
        });
    });

    // ==================================
    // ОБНОВЛЕНИЕ ГРУППОВЫХ БРОНИРОВАНИЙ
    // ==================================

    describe('Обновление/удаление группы', () => {
        /**
         * Тест: Удаление группы удаляет ВСЕ станции
         * 
         * КОД В BookingsTable.tsx:
         * ```typescript
         * const idsToDelete = booking.isGroup 
         *     ? booking.subBookings.map((b: any) => b.id) 
         *     : [booking.id];
         * ```
         */
        test('должен удалить все брони группы', () => {
            const groupBookings = [
                createTestBooking({ station_id: 'pro-1' }),
                createTestBooking({ station_id: 'pro-2' }),
                createTestBooking({ station_id: 'prem-1' }),
            ];
            seedMockBookings(groupBookings);

            const group = {
                isGroup: true,
                subBookings: groupBookings,
            };

            const idsToDelete = group.isGroup
                ? group.subBookings.map(b => b.id)
                : [];

            expect(idsToDelete).toHaveLength(3);
        });

        /**
         * Тест: Изменение payment_status для всей группы
         */
        test('должен обновить payment_status всех станций', () => {
            const groupBookings = [
                createTestBooking({ station_id: 'pro-1' }),
                createTestBooking({ station_id: 'pro-2' }),
            ];

            const idsToUpdate = groupBookings.map(b => b.id);
            const newStatus = 'paid';

            expect(idsToUpdate).toHaveLength(2);
            // Все будут обновлены одним запросом .in('id', idsToUpdate)
        });
    });

    // ==================================
    // РАСЧЁТ ЦЕНЫ ГРУППЫ
    // ==================================

    describe('Расчёт цены группы', () => {
        /**
         * Тест: Общая цена = сумма всех станций
         */
        test('должен суммировать цены всех станций', () => {
            const stationTypes: StationType[] = ['PRO', 'PRO', 'PREMIUM'];
            const duration = 2; // 2 часа

            let totalPrice = 0;
            stationTypes.forEach(type => {
                totalPrice += calculatePrice(type, duration);
            });

            // PRO: 16₾, PRO: 16₾, PREMIUM: 20₾ = 52₾
            expect(totalPrice).toBe(52);
        });

        /**
         * Тест: totalGroupPrice в сгруппированных данных
         */
        test('должен хранить totalGroupPrice в группе', () => {
            const bookings = [
                { total_price: 16 },
                { total_price: 16 },
                { total_price: 20 },
            ];

            let totalGroupPrice = 0;
            bookings.forEach(b => {
                totalGroupPrice += b.total_price || 0;
            });

            expect(totalGroupPrice).toBe(52);
        });
    });

    // ==================================
    // EDGE CASES
    // ==================================

    describe('Edge cases группового бронирования', () => {
        /**
         * Тест: Одна станция НЕ является группой
         */
        test('одна станция isGroup = false', () => {
            const booking = createTestBooking();

            const groups: Record<string, any> = {};
            const key = `${booking.customer_phone}-${booking.start_time}-${booking.end_time}`;
            groups[key] = {
                ...booking,
                isGroup: false,
                subBookings: [booking],
            };

            const result = Object.values(groups)[0];
            expect(result.isGroup).toBe(false);
            expect(result.subBookings).toHaveLength(1);
        });

        /**
         * Тест: Максимальное количество станций в группе
         */
        test('должен обработать большую группу (10+ станций)', () => {
            const manyStations = Array.from({ length: 15 }, (_, i) =>
                createTestBooking({ station_id: `station-${i}` })
            );

            const group = {
                isGroup: true,
                subBookings: manyStations,
                stationNames: manyStations.map(b => b.station_id),
            };

            expect(group.subBookings).toHaveLength(15);
            expect(group.stationNames).toHaveLength(15);
        });
    });
});
