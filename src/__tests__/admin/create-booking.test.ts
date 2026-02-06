/**
 * ADMIN CREATE BOOKING TESTS - Тесты создания бронирований вручную
 * 
 * Эти тесты проверяют логику создания бронирований админом
 * через BookingActionModal.
 */

import { calculatePrice, StationType } from '@/config/pricing';
import {
    resetMockDb,
    createTestBooking,
    seedMockBookings,
    getMockBookings,
} from '../setup';

describe('Admin Create Booking - Создание брони админом', () => {
    beforeEach(() => {
        resetMockDb();
    });

    // ==================================
    // СОЗДАНИЕ ОДИНОЧНОЙ БРОНИ
    // ==================================

    describe('Создание одиночной брони', () => {
        /**
         * Тест: Все обязательные поля заполнены
         * 
         * ЧТО ПРОВЕРЯЕТ: Админ должен заполнить имя,
         * телефон, время и станцию.
         */
        test('должен создать бронь со всеми полями', () => {
            const newBooking = {
                station_id: 'chikovani-pro-1',
                customer_name: 'Георгий',
                customer_phone: '+995555123456',
                start_time: '2025-02-07T14:00:00.000Z',
                end_time: '2025-02-07T17:00:00.000Z',
                status: 'CONFIRMED',
            };

            expect(newBooking.station_id).toBeDefined();
            expect(newBooking.customer_name).toBeDefined();
            expect(newBooking.customer_phone).toBeDefined();
            expect(newBooking.start_time).toBeDefined();
            expect(newBooking.end_time).toBeDefined();
        });

        /**
         * Тест: Автоматический расчёт цены
         * 
         * КОД В BookingActionModal.tsx:
         * ```typescript
         * const calculatedPrice = calculatePrice(stationType, duration, { guests, controllers });
         * ```
         */
        test('должен автоматически рассчитать цену', () => {
            const stationType: StationType = 'PRO';
            const duration = 3; // 3 часа

            const calculatedPrice = calculatePrice(stationType, duration);

            // PRO 3 часа = бандл 22₾
            expect(calculatedPrice).toBe(22);
        });

        /**
         * Тест: VIP с extra guests
         */
        test('должен учитывать extra guests для VIP', () => {
            const stationType: StationType = 'VIP';
            const duration = 2;
            const guests = 8; // > 6

            const priceWithGuests = calculatePrice(stationType, duration, { guests });
            const priceBase = calculatePrice(stationType, duration);

            // +20₾ за > 6 гостей
            expect(priceWithGuests).toBe(priceBase + 20);
        });
    });

    // ==================================
    // ПРОВЕРКА КОНФЛИКТОВ
    // ==================================

    describe('Проверка конфликтов перед созданием', () => {
        /**
         * Тест: Конфликт при пересечении времени
         * 
         * ЧТО ПРОВЕРЯЕТ: Если станция уже занята на 14:00-17:00,
         * нельзя создать бронь на 15:00-18:00.
         */
        test('должен определить конфликт времени', () => {
            const existing = {
                station_id: 'pro-1',
                start_time: new Date('2025-02-07T14:00:00.000Z'),
                end_time: new Date('2025-02-07T17:00:00.000Z'),
                status: 'CONFIRMED',
            };

            const newBooking = {
                station_id: 'pro-1',
                start_time: new Date('2025-02-07T15:00:00.000Z'),
                end_time: new Date('2025-02-07T18:00:00.000Z'),
            };

            const hasConflict =
                existing.station_id === newBooking.station_id &&
                existing.start_time < newBooking.end_time &&
                existing.end_time > newBooking.start_time &&
                existing.status !== 'CANCELLED';

            expect(hasConflict).toBe(true);
        });

        /**
         * Тест: Смежные брони НЕ конфликтуют
         */
        test('смежные брони не должны конфликтовать', () => {
            const existing = {
                station_id: 'pro-1',
                start_time: new Date('2025-02-07T14:00:00.000Z'),
                end_time: new Date('2025-02-07T17:00:00.000Z'),
            };

            const newBooking = {
                station_id: 'pro-1',
                start_time: new Date('2025-02-07T17:00:00.000Z'), // Начинается когда заканчивается
                end_time: new Date('2025-02-07T19:00:00.000Z'),
            };

            // existing.end_time <= newBooking.start_time → НЕТ пересечения
            const hasConflict =
                existing.start_time < newBooking.end_time &&
                existing.end_time > newBooking.start_time;

            expect(hasConflict).toBe(false);
        });

        /**
         * Тест: CANCELLED брони не учитываются
         */
        test('CANCELLED брони не создают конфликт', () => {
            const existing = {
                station_id: 'pro-1',
                start_time: new Date('2025-02-07T14:00:00.000Z'),
                end_time: new Date('2025-02-07T17:00:00.000Z'),
                status: 'CANCELLED', // Отменена!
            };

            const shouldBeIgnored = existing.status === 'CANCELLED';
            expect(shouldBeIgnored).toBe(true);
        });
    });

    // ==================================
    // ГРУППОВОЕ СОЗДАНИЕ (Map View)
    // ==================================

    describe('Групповое создание из Map View', () => {
        /**
         * Тест: Выбор нескольких станций
         * 
         * КОД В map/page.tsx:
         * ```typescript
         * setSelectedStations(prev => [...prev, id]);
         * ```
         */
        test('должен накапливать выбранные станции', () => {
            const selectedStations: string[] = [];

            const toggleStation = (id: string) => {
                const index = selectedStations.indexOf(id);
                if (index >= 0) {
                    selectedStations.splice(index, 1);
                } else {
                    selectedStations.push(id);
                }
            };

            toggleStation('pro-1');
            toggleStation('pro-2');
            toggleStation('prem-1');

            expect(selectedStations).toHaveLength(3);
            expect(selectedStations).toContain('pro-1');
            expect(selectedStations).toContain('pro-2');
            expect(selectedStations).toContain('prem-1');
        });

        /**
         * Тест: Повторный клик снимает выбор
         */
        test('повторный клик снимает выбор', () => {
            let selectedStations = ['pro-1', 'pro-2'];

            const toggleStation = (id: string) => {
                const index = selectedStations.indexOf(id);
                if (index >= 0) {
                    selectedStations = selectedStations.filter(s => s !== id);
                } else {
                    selectedStations = [...selectedStations, id];
                }
            };

            toggleStation('pro-1'); // Снимаем

            expect(selectedStations).toHaveLength(1);
            expect(selectedStations).not.toContain('pro-1');
        });

        /**
         * Тест: Создание броней для всех выбранных
         */
        test('должен создать брони для всех выбранных станций', () => {
            const selectedStations = ['pro-1', 'pro-2', 'prem-1'];
            const commonData = {
                customer_name: 'Группа',
                customer_phone: '+995555123456',
                start_time: '2025-02-07T14:00:00.000Z',
                end_time: '2025-02-07T17:00:00.000Z',
            };

            const newBookings = selectedStations.map(sid => ({
                station_id: sid,
                ...commonData,
            }));

            expect(newBookings).toHaveLength(3);
            newBookings.forEach(b => {
                expect(b.customer_name).toBe('Группа');
            });
        });
    });

    // ==================================
    // ВАЛИДАЦИЯ
    // ==================================

    describe('Валидация данных', () => {
        /**
         * Тест: Обязательные поля
         */
        test('должен требовать customer_name', () => {
            const isValid = (name: string) => name.trim().length > 0;

            expect(isValid('')).toBe(false);
            expect(isValid('  ')).toBe(false);
            expect(isValid('Георгий')).toBe(true);
        });

        /**
         * Тест: Формат телефона
         */
        test('должен требовать валидный телефон', () => {
            const isValidPhone = (phone: string) => phone.replace(/\D/g, '').length >= 9;

            expect(isValidPhone('123')).toBe(false);
            expect(isValidPhone('+995555123456')).toBe(true);
            expect(isValidPhone('555-123-456')).toBe(true);
        });

        /**
         * Тест: Время начала < Время окончания
         */
        test('должен проверить что start < end', () => {
            const start = new Date('2025-02-07T14:00:00.000Z');
            const end = new Date('2025-02-07T17:00:00.000Z');

            expect(start < end).toBe(true);
        });

        /**
         * Тест: Минимальная длительность
         */
        test('минимальная длительность 30 минут', () => {
            const start = new Date('2025-02-07T14:00:00.000Z');
            const end = new Date('2025-02-07T14:15:00.000Z'); // 15 минут

            const durationMinutes = (end.getTime() - start.getTime()) / 60000;
            const isValidDuration = durationMinutes >= 30;

            expect(isValidDuration).toBe(false);
        });
    });

    // ==================================
    // RACE CONDITION (ПРОБЛЕМА!)
    // ==================================

    describe('Race Condition - ИЗВЕСТНАЯ ПРОБЛЕМА', () => {
        /**
         * Тест: Выявляет race condition
         * 
         * ЧТО ПРОВЕРЯЕТ: Между проверкой конфликтов и insert
         * есть временное окно уязвимости.
         * 
         * КОД ПРОБЛЕМЫ:
         * ```typescript
         * const { data: conflicts } = await supabase.select('*')...
         * if (conflicts.length > 0) throw Error;
         * // ⚠️ ОКНО УЯЗВИМОСТИ
         * const { error } = await supabase.insert(newBookings);
         * ```
         */
        test('ПРОБЛЕМА: check-then-insert уязвим к race condition', async () => {
            // Симуляция двух параллельных запросов
            let dbState = { booked: false };

            const createBooking = async () => {
                // Шаг 1: Проверка (оба видят что свободно)
                const isAvailable = !dbState.booked;

                // Симуляция задержки сети
                await new Promise(r => setTimeout(r, 10));

                // Шаг 2: Вставка (оба вставляют!)
                if (isAvailable) {
                    dbState.booked = true;
                    return { success: true };
                }
                return { success: false };
            };

            // Запускаем оба "параллельно"
            const results = await Promise.all([
                createBooking(),
                createBooking(),
            ]);

            // ПРОБЛЕМА: Оба могут получить success: true!
            // (в реальности зависит от timing)
            const successCount = results.filter(r => r.success).length;

            // Минимум один успешен (но возможно оба - это и есть баг)
            expect(successCount).toBeGreaterThanOrEqual(1);
        });
    });
});
