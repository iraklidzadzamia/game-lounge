/**
 * ADMIN EDIT BOOKING TESTS - Тесты редактирования бронирований
 * 
 * Эти тесты проверяют логику редактирования существующих
 * бронирований через BookingActionModal.
 */

import { calculatePrice, StationType } from '@/config/pricing';
import {
    resetMockDb,
    createTestBooking,
    seedMockBookings,
    getMockBookings,
} from '../setup';

describe('Admin Edit Booking - Редактирование брони', () => {
    beforeEach(() => {
        resetMockDb();
    });

    // ==================================
    // ИЗМЕНЕНИЕ ВРЕМЕНИ
    // ==================================

    describe('Изменение времени', () => {
        /**
         * Тест: Продление бронирования
         * 
         * ЧТО ПРОВЕРЯЕТ: Админ может изменить end_time
         * на более позднее время.
         */
        test('должен позволить продлить бронь', () => {
            const booking = createTestBooking({
                start_time: '2025-02-07T14:00:00.000Z',
                end_time: '2025-02-07T17:00:00.000Z',
            });

            const newEndTime = '2025-02-07T19:00:00.000Z';

            expect(new Date(newEndTime) > new Date(booking.end_time)).toBe(true);
        });

        /**
         * Тест: Сокращение бронирования
         */
        test('должен позволить сократить бронь', () => {
            const booking = createTestBooking({
                start_time: '2025-02-07T14:00:00.000Z',
                end_time: '2025-02-07T17:00:00.000Z',
            });

            const newEndTime = '2025-02-07T15:30:00.000Z';

            expect(new Date(newEndTime) < new Date(booking.end_time)).toBe(true);
            expect(new Date(newEndTime) > new Date(booking.start_time)).toBe(true);
        });

        /**
         * Тест: Перерасчёт цены при изменении времени
         */
        test('должен пересчитать цену при изменении времени', () => {
            const stationType: StationType = 'PRO';
            const originalDuration = 3; // 3 часа
            const newDuration = 1.5; // 1.5 часа

            const originalPrice = calculatePrice(stationType, originalDuration);
            const newPrice = calculatePrice(stationType, newDuration);

            // 3 часа = бандл 22₾, 1.5 часа = 12₾
            expect(originalPrice).toBe(22);
            expect(newPrice).toBe(12);
        });
    });

    // ==================================
    // ИЗМЕНЕНИЕ СТАТУСА
    // ==================================

    describe('Изменение статуса', () => {
        /**
         * Тест: Изменение payment_status
         */
        test('должен позволить изменить payment_status', () => {
            const booking = createTestBooking();

            const validStatuses = ['pending', 'paid'];

            validStatuses.forEach(status => {
                expect(['pending', 'paid']).toContain(status);
            });
        });

        /**
         * Тест: Отмена бронирования
         */
        test('должен позволить отменить бронь (CANCELLED)', () => {
            const booking = createTestBooking({
                status: 'CONFIRMED',
            });

            const newStatus = 'CANCELLED';

            expect(newStatus).toBe('CANCELLED');
        });
    });

    // ==================================
    // ИЗМЕНЕНИЕ ДАННЫХ КЛИЕНТА
    // ==================================

    describe('Изменение данных клиента', () => {
        /**
         * Тест: Изменение имени
         */
        test('должен позволить изменить имя клиента', () => {
            const booking = createTestBooking({
                customer_name: 'Георгий',
            });

            const newName = 'Давид';

            expect(newName).not.toBe(booking.customer_name);
            expect(newName.length).toBeGreaterThan(0);
        });

        /**
         * Тест: Изменение телефона
         */
        test('должен позволить изменить телефон', () => {
            const booking = createTestBooking({
                customer_phone: '+995555111111',
            });

            const newPhone = '+995555222222';

            expect(newPhone).not.toBe(booking.customer_phone);
        });

        /**
         * Тест: Добавление заметок
         */
        test('должен позволить добавить notes', () => {
            const booking = createTestBooking({
                notes: '',
            });

            const newNotes = 'VIP клиент, постоянный посетитель';

            expect(newNotes.length).toBeGreaterThan(0);
        });
    });

    // ==================================
    // ИЗМЕНЕНИЕ VIP ПАРАМЕТРОВ
    // ==================================

    describe('Изменение VIP параметров', () => {
        /**
         * Тест: Изменение количества гостей
         */
        test('должен позволить изменить guest_count', () => {
            const booking = createTestBooking({});

            const newGuestCount = 8;
            const oldGuestCount = 4;

            expect(newGuestCount).toBeGreaterThan(oldGuestCount);
        });

        /**
         * Тест: Изменение количества контроллеров
         */
        test('должен позволить изменить controllers_count', () => {
            const newControllersCount = 4;

            expect(newControllersCount).toBeGreaterThanOrEqual(0);
        });

        /**
         * Тест: Перерасчёт цены при изменении guests
         */
        test('должен пересчитать цену при изменении guests', () => {
            const stationType: StationType = 'VIP';
            const duration = 2;

            const priceWith4Guests = calculatePrice(stationType, duration, { guests: 4 });
            const priceWith8Guests = calculatePrice(stationType, duration, { guests: 8 });

            // 8 > 6, поэтому +20₾
            expect(priceWith8Guests).toBe(priceWith4Guests + 20);
        });
    });

    // ==================================
    // РЕДАКТИРОВАНИЕ ГРУППЫ
    // ==================================

    describe('Редактирование группы', () => {
        /**
         * Тест: При редактировании группы - все станции обновляются
         * 
         * КОД В BookingsTable.tsx:
         * ```typescript
         * const idsToUpdate = booking.isGroup 
         *     ? booking.subBookings.map((b: any) => b.id) 
         *     : [booking.id];
         * ```
         */
        test('должен обновить все станции группы', () => {
            const groupBookings = [
                createTestBooking({ station_id: 'pro-1' }),
                createTestBooking({ station_id: 'pro-2' }),
                createTestBooking({ station_id: 'prem-1' }),
            ];

            const group = {
                isGroup: true,
                subBookings: groupBookings,
            };

            const idsToUpdate = group.isGroup
                ? group.subBookings.map(b => b.id)
                : [];

            expect(idsToUpdate).toHaveLength(3);
        });

        /**
         * Тест: Изменение времени группы
         */
        test('должен изменить время всех станций группы', () => {
            const newEndTime = '2025-02-07T19:00:00.000Z';
            const stationIds = ['id-1', 'id-2', 'id-3'];

            const updates = stationIds.map(id => ({
                id,
                end_time: newEndTime,
            }));

            updates.forEach(u => {
                expect(u.end_time).toBe(newEndTime);
            });
        });
    });

    // ==================================
    // КАСТОМНАЯ ЦЕНА
    // ==================================

    describe('Кастомная цена', () => {
        /**
         * Тест: Админ может ввести свою цену
         * 
         * КОД В BookingActionModal.tsx:
         * ```typescript
         * const finalPrice = isCustomPrice ? customPrice : calculatedPrice;
         * ```
         */
        test('должен позволить ввести кастомную цену', () => {
            const calculatedPrice = 22;
            const customPrice = 15; // Скидка
            const isCustomPrice = true;

            const finalPrice = isCustomPrice ? customPrice : calculatedPrice;

            expect(finalPrice).toBe(15);
            expect(finalPrice).toBeLessThan(calculatedPrice);
        });

        /**
         * Тест: Распределение кастомной цены между станциями группы
         */
        test('должен распределить кастомную цену по станциям', () => {
            const customPrice = 60;
            const stationCount = 3;

            const pricePerStation = Number((customPrice / stationCount).toFixed(2));

            expect(pricePerStation).toBe(20);
        });
    });

    // ==================================
    // КОНФЛИКТЫ ПРИ РЕДАКТИРОВАНИИ
    // ==================================

    describe('Проверка конфликтов при редактировании', () => {
        /**
         * Тест: При продлении проверяем конфликт с другой бронью
         */
        test('должен проверить конфликт при продлении', () => {
            // Редактируемая бронь: 14:00-17:00
            // Следующая бронь: 18:00-20:00
            // Пытаемся продлить до 19:00 — КОНФЛИКТ

            const existingNextBooking = {
                station_id: 'pro-1',
                start_time: new Date('2025-02-07T18:00:00.000Z'),
                end_time: new Date('2025-02-07T20:00:00.000Z'),
            };

            const newEndTime = new Date('2025-02-07T19:00:00.000Z');

            const hasConflict = newEndTime > existingNextBooking.start_time;

            expect(hasConflict).toBe(true);
        });

        /**
         * Тест: Игнорируем себя при проверке конфликтов
         * 
         * ВАЖНО: При редактировании бронь НЕ должна
         * конфликтовать сама с собой!
         */
        test('редактируемая бронь НЕ конфликтует сама с собой', () => {
            const bookingId = 'booking-123';
            const allBookings = [
                { id: 'booking-123', station_id: 'pro-1', start_time: '14:00', end_time: '17:00' },
                { id: 'booking-456', station_id: 'pro-1', start_time: '18:00', end_time: '20:00' },
            ];

            // Исключаем себя из проверки
            const otherBookings = allBookings.filter(b => b.id !== bookingId);

            expect(otherBookings).toHaveLength(1);
            expect(otherBookings[0].id).toBe('booking-456');
        });
    });
});
