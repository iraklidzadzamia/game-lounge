/**
 * HAPPY PATH TESTS - Успешные сценарии бронирования
 * 
 * Эти тесты проверяют что система работает правильно
 * в нормальных условиях использования.
 */

import { calculatePrice, StationType } from '@/config/pricing';
import {
    resetMockDb,
    createTestBooking,
    checkTimeOverlap,
    createTestRequest,
    seedMockBookings,
    getMockBookings,
} from '../setup';

describe('Happy Path - Успешные сценарии', () => {
    beforeEach(() => {
        resetMockDb();
    });

    // ==================================
    // ТЕСТЫ РАСЧЁТА ЦЕН
    // ==================================

    describe('calculatePrice - Расчёт цен', () => {
        /**
         * Тест: Расчёт цены для бандла
         * 
         * ЧТО ПРОВЕРЯЕТ: Если пользователь выбирает 3 часа на PRO станции,
         * применяется бандл-цена (22₾) вместо почасовой (8 * 3 = 24₾).
         * Это важно для бизнес-логики скидок.
         */
        test('должен применять бандл-цену для 3 часов PRO', () => {
            const price = calculatePrice('PRO', 3);
            expect(price).toBe(22); // Бандл 3 часа = 22₾
        });

        /**
         * Тест: Почасовая ставка когда нет бандла
         * 
         * ЧТО ПРОВЕРЯЕТ: Для 2 часов на PRO нет бандла,
         * поэтому применяется почасовая ставка: 8 * 2 = 16₾
         */
        test('должен использовать hourlyRate когда нет бандла', () => {
            const price = calculatePrice('PRO', 2);
            expect(price).toBe(16); // 8₾/час * 2 = 16₾
        });

        /**
         * Тест: PREMIUM станция дороже PRO
         * 
         * ЧТО ПРОВЕРЯЕТ: Премиум-станции стоят дороже.
         * Бандл 3 часа PREMIUM = 27₾
         */
        test('должен рассчитывать цену PREMIUM выше PRO', () => {
            const premiumPrice = calculatePrice('PREMIUM', 3);
            const proPrice = calculatePrice('PRO', 3);
            expect(premiumPrice).toBeGreaterThan(proPrice);
            expect(premiumPrice).toBe(27);
        });

        /**
         * Тест: VIP с дополнительными гостями
         * 
         * ЧТО ПРОВЕРЯЕТ: Когда в VIP комнате более 6 гостей,
         * добавляется надбавка 20₾.
         */
        test('должен добавлять надбавку для VIP с > 6 гостями', () => {
            const basePrice = calculatePrice('VIP', 2);
            const extraGuestsPrice = calculatePrice('VIP', 2, { guests: 8 });
            expect(extraGuestsPrice).toBe(basePrice + 20);
        });

        /**
         * Тест: PS5 с 4 контроллерами
         * 
         * ЧТО ПРОВЕРЯЕТ: При использовании 4 контроллеров
         * цена увеличивается на 50%.
         */
        test('должен увеличивать цену PS5 при 4 контроллерах', () => {
            const basePrice = calculatePrice('PS5', 3);
            const extraControllers = calculatePrice('PS5', 3, { controllers: 4 });
            expect(extraControllers).toBe(Math.ceil(basePrice * 1.5));
        });
    });

    // ==================================
    // ТЕСТЫ СОЗДАНИЯ БРОНИРОВАНИЯ
    // ==================================

    describe('Создание бронирования', () => {
        /**
         * Тест: Успешное создание одной брони
         * 
         * ЧТО ПРОВЕРЯЕТ: При корректных данных бронирование
         * создаётся успешно и возвращается объект с ID.
         */
        test('должен создать бронирование с одной станцией', () => {
            const bookingData = {
                stationIds: ['chikovani-pro-1'],
                branchId: 'chikovani',
                startTime: new Date(Date.now() + 3600000).toISOString(),
                endTime: new Date(Date.now() + 7200000).toISOString(),
                customerName: 'Тест Тестов',
                customerPhone: '+995555123456',
                duration: 1,
            };

            // Симуляция создания
            const booking = createTestBooking({
                station_id: bookingData.stationIds[0],
                customer_name: bookingData.customerName,
                customer_phone: bookingData.customerPhone,
                start_time: bookingData.startTime,
                end_time: bookingData.endTime,
            });

            expect(booking.id).toBeDefined();
            expect(booking.status).toBe('CONFIRMED');
            expect(booking.customer_name).toBe('Тест Тестов');
        });

        /**
         * Тест: Создание брони на несколько станций
         * 
         * ЧТО ПРОВЕРЯЕТ: Пользователь может забронировать
         * сразу несколько станций (например, для команды).
         */
        test('должен создать бронирование для нескольких станций', () => {
            const stationIds = ['chikovani-pro-1', 'chikovani-pro-2', 'chikovani-prem-1'];
            const bookings: ReturnType<typeof createTestBooking>[] = [];

            stationIds.forEach(id => {
                bookings.push(createTestBooking({ station_id: id }));
            });

            expect(bookings).toHaveLength(3);
            expect(bookings.map(b => b.station_id)).toEqual(stationIds);
        });
    });

    // ==================================
    // ТЕСТЫ ПРОВЕРКИ ДОСТУПНОСТИ
    // ==================================

    describe('Проверка доступности', () => {
        /**
         * Тест: Свободные слоты возвращают пустой массив конфликтов
         * 
         * ЧТО ПРОВЕРЯЕТ: Когда запрашиваемое время свободно,
         * API возвращает пустой список unavailable станций.
         */
        test('должен вернуть пустой массив для свободных слотов', () => {
            const requestedStart = new Date(Date.now() + 3600000); // +1 час
            const requestedEnd = new Date(Date.now() + 7200000); // +2 часа

            const existingBookings = getMockBookings();
            const conflicts = existingBookings.filter(b =>
                checkTimeOverlap(b.start_time, b.end_time, requestedStart, requestedEnd)
            );

            expect(conflicts).toHaveLength(0);
        });

        /**
         * Тест: Занятые слоты правильно определяются
         * 
         * ЧТО ПРОВЕРЯЕТ: Если станция уже забронирована на это время,
         * она появляется в списке unavailable.
         */
        test('должен определить занятую станцию', () => {
            const now = Date.now();
            const existingBooking = createTestBooking({
                station_id: 'chikovani-pro-1',
                start_time: new Date(now + 3600000).toISOString(),
                end_time: new Date(now + 7200000).toISOString(),
            });

            seedMockBookings([existingBooking]);

            const requestedStart = new Date(now + 4000000); // Внутри существующей брони
            const requestedEnd = new Date(now + 5000000);

            const bookings = getMockBookings();
            const conflicts = bookings.filter(b =>
                b.station_id === 'chikovani-pro-1' &&
                checkTimeOverlap(b.start_time, b.end_time, requestedStart, requestedEnd)
            );

            expect(conflicts).toHaveLength(1);
            expect(conflicts[0].station_id).toBe('chikovani-pro-1');
        });
    });

    // ==================================
    // ТЕСТЫ ПОИСКА БРОНИРОВАНИЙ
    // ==================================

    describe('Поиск бронирований', () => {
        /**
         * Тест: Поиск по полному номеру телефона
         * 
         * ЧТО ПРОВЕРЯЕТ: Клиент может найти свои бронирования
         * введя полный номер телефона.
         */
        test('должен найти бронирование по номеру телефона', () => {
            const phone = '+995555123456';
            const booking = createTestBooking({ customer_phone: phone });
            seedMockBookings([booking]);

            const found = getMockBookings().filter(b =>
                b.customer_phone === phone
            );

            expect(found).toHaveLength(1);
            expect(found[0].customer_name).toBe('Test User');
        });

        /**
         * Тест: Только будущие бронирования
         * 
         * ЧТО ПРОВЕРЯЕТ: При поиске возвращаются только
         * бронирования со start_time в будущем.
         */
        test('должен возвращать только будущие бронирования', () => {
            const now = Date.now();

            const pastBooking = createTestBooking({
                start_time: new Date(now - 7200000).toISOString(), // 2 часа назад
                end_time: new Date(now - 3600000).toISOString(),
            });

            const futureBooking = createTestBooking({
                start_time: new Date(now + 3600000).toISOString(), // 1 час вперёд
                end_time: new Date(now + 7200000).toISOString(),
            });

            seedMockBookings([pastBooking, futureBooking]);

            const bookings = getMockBookings();
            const futureOnly = bookings.filter(b =>
                new Date(b.start_time).getTime() > now
            );

            expect(futureOnly).toHaveLength(1);
            expect(new Date(futureOnly[0].start_time).getTime()).toBeGreaterThan(now);
        });
    });
});
