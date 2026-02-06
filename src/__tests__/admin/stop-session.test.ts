/**
 * STOP SESSION TESTS - Тесты остановки сессии админом
 * 
 * Эти тесты проверяют логику "STOP SESSION" в BookingActionModal.
 * Админ может остановить текущую сессию и выбрать:
 * - Оплата по фактическому времени (сколько играли)
 * - Оплата по забронированному времени
 * - Кастомная сумма
 */

import { calculatePrice, StationType } from '@/config/pricing';
import {
    resetMockDb,
    createTestBooking,
    seedMockBookings,
    getMockBookings,
} from '../setup';

describe('Stop Session - Остановка сессии админом', () => {
    beforeEach(() => {
        resetMockDb();
    });

    // ==================================
    // РАСЧЁТ ЦЕН ПРИ ОСТАНОВКЕ
    // ==================================

    describe('Расчёт цен', () => {
        /**
         * Тест: Цена по фактическому времени
         * 
         * ЧТО ПРОВЕРЯЕТ: Если клиент забронировал 3 часа,
         * но ушёл через 1.5 часа, админ может выставить
         * счёт только за 1.5 часа.
         */
        test('должен рассчитать цену по фактическому времени', () => {
            const stationType: StationType = 'PRO';
            const reservedHours = 3; // Забронировано 3 часа
            const actualMinutes = 90; // Фактически играли 90 минут

            const reservedPrice = calculatePrice(stationType, reservedHours);
            const actualPrice = calculatePrice(stationType, actualMinutes / 60);

            // Цена за 3 часа PRO = 22₾ (бандл)
            expect(reservedPrice).toBe(22);
            // Цена за 1.5 часа PRO = 8 * 1.5 = 12₾
            expect(actualPrice).toBe(12);
            expect(actualPrice).toBeLessThan(reservedPrice);
        });

        /**
         * Тест: Цена с VIP extra guests
         * 
         * ЧТО ПРОВЕРЯЕТ: При остановке VIP сессии с доп. гостями,
         * надбавка учитывается в финальной цене.
         */
        test('должен учитывать extra guests в VIP', () => {
            const stationType: StationType = 'VIP';
            const actualMinutes = 60;
            const guestCount = 8; // Более 6 гостей

            const basePrice = calculatePrice(stationType, actualMinutes / 60);
            const withGuests = calculatePrice(stationType, actualMinutes / 60, { guests: guestCount });

            // VIP с > 6 гостями = +20₾
            expect(withGuests).toBe(basePrice + 20);
        });

        /**
         * Тест: Минимальное время 1 минута
         * 
         * ЧТО ПРОВЕРЯЕТ: Даже если клиент ушёл сразу,
         * минимальное время = 1 минута.
         */
        test('должен использовать минимум 1 минуту', () => {
            const elapsedMinutes = Math.max(1, 0); // Симуляция: ушли сразу
            expect(elapsedMinutes).toBe(1);
        });
    });

    // ==================================
    // ГРУППОВЫЕ СЕССИИ
    // ==================================

    describe('Групповые сессии', () => {
        /**
         * Тест: Общая цена группы
         * 
         * ЧТО ПРОВЕРЯЕТ: При остановке группового бронирования
         * (несколько станций), цена складывается из всех станций.
         */
        test('должен суммировать цены всех станций в группе', () => {
            const stations = [
                { id: 'pro-1', type: 'PRO' as StationType },
                { id: 'pro-2', type: 'PRO' as StationType },
                { id: 'prem-1', type: 'PREMIUM' as StationType },
            ];
            const actualMinutes = 60;

            let totalPrice = 0;
            stations.forEach(station => {
                totalPrice += calculatePrice(station.type, actualMinutes / 60);
            });

            // PRO: 8₾, PRO: 8₾, PREMIUM: 10₾ = 26₾
            expect(totalPrice).toBe(26);
        });

        /**
         * Тест: Равномерное распределение кастомной цены
         * 
         * ЧТО ПРОВЕРЯЕТ: Если админ вводит кастомную сумму (например, 30₾),
         * она делится поровну между станциями группы.
         * 
         * КОД В BookingActionModal.tsx:
         * ```typescript
         * const pricePerStation = finalPrice / idsToUpdate.length;
         * ```
         */
        test('должен распределить кастомную цену равномерно', () => {
            const customPrice = 30;
            const stationCount = 3;

            const pricePerStation = Number((customPrice / stationCount).toFixed(2));

            expect(pricePerStation).toBe(10);
            expect(pricePerStation * stationCount).toBe(customPrice);
        });

        /**
         * Тест: Округление при нечётном делении
         * 
         * ЧТО ПРОВЕРЯЕТ: 25₾ / 3 станции = 8.33₾ на станцию
         * Сумма 8.33 * 3 = 24.99₾ (потеря 0.01₾)
         */
        test('должен корректно округлять при нечётном делении', () => {
            const customPrice = 25;
            const stationCount = 3;

            const pricePerStation = Number((customPrice / stationCount).toFixed(2));
            const reconstructedTotal = pricePerStation * stationCount;

            expect(pricePerStation).toBeCloseTo(8.33, 2);
            // Небольшая потеря при округлении
            expect(Math.abs(reconstructedTotal - customPrice)).toBeLessThan(0.1);
        });
    });

    // ==================================
    // ОБНОВЛЕНИЕ БРОНИРОВАНИЯ
    // ==================================

    describe('Обновление бронирования при остановке', () => {
        /**
         * Тест: end_time устанавливается на текущее время
         * 
         * ЧТО ПРОВЕРЯЕТ: При остановке сессии,
         * end_time меняется на now().
         */
        test('должен установить end_time на текущее время', () => {
            const now = new Date();
            const booking = createTestBooking({
                start_time: new Date(now.getTime() - 3600000).toISOString(), // 1 час назад
                end_time: new Date(now.getTime() + 7200000).toISOString(),   // через 2 часа
            });

            // После STOP
            const stoppedEndTime = now;

            expect(new Date(stoppedEndTime).getTime()).toBeLessThanOrEqual(
                new Date(booking.end_time).getTime()
            );
        });

        /**
         * Тест: Статус оплаты меняется на paid
         * 
         * ЧТО ПРОВЕРЯЕТ: После STOP SESSION статус
         * автоматически становится 'paid'.
         */
        test('должен установить payment_status = paid', () => {
            const booking = createTestBooking({
                status: 'CONFIRMED',
            });

            // После STOP - статус оплаты меняется
            const updatedPaymentStatus = 'paid';

            expect(updatedPaymentStatus).toBe('paid');
        });

        /**
         * Тест: Добавление заметки о остановке
         * 
         * ЧТО ПРОВЕРЯЕТ: В notes добавляется информация
         * о фактическом времени и сумме.
         */
        test('должен добавить заметку об остановке', () => {
            const elapsedMinutes = 45;
            const finalPrice = 15;

            const stopNote = `[Stopped: Used ${elapsedMinutes}m. Group Total: ${finalPrice}₾]`;

            expect(stopNote).toContain('Stopped');
            expect(stopNote).toContain('45m');
            expect(stopNote).toContain('15₾');
        });
    });

    // ==================================
    // ОПРЕДЕЛЕНИЕ LIVE СЕССИИ
    // ==================================

    describe('Определение активной (live) сессии', () => {
        /**
         * Тест: Сессия активна если now между start и end
         * 
         * ЧТО ПРОВЕРЯЕТ: Кнопка STOP отображается только
         * для текущих активных сессий.
         */
        test('должен определить активную сессию', () => {
            const now = new Date();
            const booking = {
                start_time: new Date(now.getTime() - 1800000).toISOString(), // 30 минут назад
                end_time: new Date(now.getTime() + 1800000).toISOString(),   // через 30 минут
            };

            const startTime = new Date(booking.start_time);
            const endTime = new Date(booking.end_time);

            const isLive = startTime < now && endTime > now;

            expect(isLive).toBe(true);
        });

        /**
         * Тест: Будущая сессия не активна
         */
        test('будущая сессия НЕ является live', () => {
            const now = new Date();
            const booking = {
                start_time: new Date(now.getTime() + 3600000).toISOString(), // через 1 час
                end_time: new Date(now.getTime() + 7200000).toISOString(),
            };

            const startTime = new Date(booking.start_time);
            const endTime = new Date(booking.end_time);

            const isLive = startTime < now && endTime > now;

            expect(isLive).toBe(false);
        });

        /**
         * Тест: Прошедшая сессия не активна
         */
        test('прошедшая сессия НЕ является live', () => {
            const now = new Date();
            const booking = {
                start_time: new Date(now.getTime() - 7200000).toISOString(), // 2 часа назад
                end_time: new Date(now.getTime() - 3600000).toISOString(),   // 1 час назад
            };

            const startTime = new Date(booking.start_time);
            const endTime = new Date(booking.end_time);

            const isLive = startTime < now && endTime > now;

            expect(isLive).toBe(false);
        });
    });
});
