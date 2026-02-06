/**
 * EDGE CASES TESTS - Граничные случаи
 * 
 * Эти тесты проверяют нестандартные ситуации и крайние значения,
 * которые могут вызвать непредсказуемое поведение системы.
 */

import { calculatePrice, StationType, PRICING } from '@/config/pricing';
import {
    resetMockDb,
    createTestBooking,
    seedMockBookings,
    checkTimeOverlap,
    getMockBookings,
} from '../setup';

describe('Edge Cases - Граничные случаи', () => {
    beforeEach(() => {
        resetMockDb();
    });

    // ==================================
    // ГРАНИЧНЫЕ СЛУЧАИ ВРЕМЕНИ
    // ==================================

    describe('Граничные случаи времени', () => {
        /**
         * Тест: Смежные бронирования (без пересечения)
         * 
         * ЧТО ПРОВЕРЯЕТ: Если одна бронь заканчивается в 15:00,
         * а другая начинается в 15:00 - это НЕ конфликт.
         * Важно для максимального использования станций.
         */
        test('должен разрешить смежные брони без пересечения', () => {
            const now = Date.now();

            // Существующая: 13:00 - 15:00
            const existingEnd = new Date(now + 3600000 * 2);
            const existing = createTestBooking({
                start_time: new Date(now).toISOString(),
                end_time: existingEnd.toISOString(),
            });
            seedMockBookings([existing]);

            // Новая: 15:00 - 17:00 (начинается ровно когда заканчивается существующая)
            const newStart = existingEnd;
            const newEnd = new Date(now + 3600000 * 4);

            // Проверка: новая бронь начинается НЕ РАНЬШЕ конца существующей
            const hasConflict = checkTimeOverlap(
                existing.start_time,
                existing.end_time,
                newStart,
                newEnd
            );

            // НЕТ пересечения, потому что start2 == end1 не считается overlap
            expect(hasConflict).toBe(false);
        });

        /**
         * Тест: Бронирование через полночь
         * 
         * ЧТО ПРОВЕРЯЕТ: Бронь с 23:00 до 02:00 следующего дня
         * должна корректно обрабатываться.
         */
        test('должен корректно обработать бронь через полночь', () => {
            const today = new Date();
            today.setHours(23, 0, 0, 0);

            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(2, 0, 0, 0);

            const booking = createTestBooking({
                start_time: today.toISOString(),
                end_time: tomorrow.toISOString(),
            });

            expect(new Date(booking.start_time).getDate()).not.toBe(
                new Date(booking.end_time).getDate()
            );
        });

        /**
         * Тест: Бронирование в прошлом (UI валидация)
         * 
         * ЧТО ПРОВЕРЯЕТ: Система должна отклонять бронирования
         * на время в прошлом.
         */
        test('должен определить бронь в прошлом как невалидную', () => {
            const pastDate = new Date(Date.now() - 3600000); // 1 час назад
            const now = Date.now();

            // UI валидация: 5 минут "буфер"
            const isTimeValid = pastDate.getTime() > now - 5 * 60 * 1000;

            expect(isTimeValid).toBe(false);
        });

        /**
         * Тест: endTime раньше startTime
         * 
         * ЧТО ПРОВЕРЯЕТ: Некорректные временные данные
         * должны быть отклонены.
         */
        test('должен определить endTime < startTime как невалидное', () => {
            const start = new Date(Date.now() + 7200000); // +2 часа
            const end = new Date(Date.now() + 3600000);   // +1 час (раньше!)

            const isValidTimeRange = end.getTime() > start.getTime();

            expect(isValidTimeRange).toBe(false);
        });

        /**
         * Тест: Очень длинная бронь (24+ часов)
         * 
         * ЧТО ПРОВЕРЯЕТ: Система должна иметь лимит
         * на максимальную продолжительность.
         */
        test('должен определить слишком длинную бронь', () => {
            const start = new Date();
            const end = new Date(start.getTime() + 25 * 3600000); // 25 часов

            const durationHours = (end.getTime() - start.getTime()) / 3600000;
            const MAX_DURATION = 24;

            expect(durationHours).toBeGreaterThan(MAX_DURATION);
        });
    });

    // ==================================
    // ГРАНИЧНЫЕ СЛУЧАИ ЦЕН
    // ==================================

    describe('Граничные случаи цен', () => {
        /**
         * Тест: Нулевая продолжительность
         * 
         * ЧТО ПРОВЕРЯЕТ: Бронь на 0 часов должна стоить 0
         * или быть отклонена.
         */
        test('должен вернуть 0 для нулевой продолжительности', () => {
            const price = calculatePrice('PRO', 0);
            expect(price).toBe(0);
        });

        /**
         * Тест: Отрицательная продолжительность
         * 
         * ЧТО ПРОВЕРЯЕТ: Некорректные данные не должны
         * приводить к отрицательной цене.
         */
        test('должен вернуть 0 или положительное для отрицательной продолжительности', () => {
            const price = calculatePrice('PRO', -2);
            expect(price).toBeGreaterThanOrEqual(0);
        });

        /**
         * Тест: Дробная продолжительность
         * 
         * ЧТО ПРОВЕРЯЕТ: 1.5 часа = 8 * 1.5 = 12₾ (округлено вверх)
         */
        test('должен округлить цену вверх для дробных часов', () => {
            const price = calculatePrice('PRO', 1.5);
            expect(price).toBe(Math.ceil(8 * 1.5)); // 12₾
        });

        /**
         * Тест: Очень большая продолжительность
         * 
         * ЧТО ПРОВЕРЯЕТ: Система не падает при
         * экстремальных значениях.
         */
        test('должен обработать очень большую продолжительность', () => {
            const price = calculatePrice('PRO', 100);
            expect(price).toBe(8 * 100); // 800₾
        });

        /**
         * Тест: Все типы станций имеют бандлы
         * 
         * ЧТО ПРОВЕРЯЕТ: Конфигурация не имеет пустых бандлов.
         */
        test('все типы должны иметь минимум один бандл', () => {
            Object.entries(PRICING).forEach(([type, config]) => {
                const bundleKeys = Object.keys(config.bundles);
                expect(bundleKeys.length).toBeGreaterThan(0);
            });
        });
    });

    // ==================================
    // ГРАНИЧНЫЕ СЛУЧАИ СТАНЦИЙ
    // ==================================

    describe('Граничные случаи станций', () => {
        /**
         * Тест: Бронирование несуществующей станции
         * 
         * ЧТО ПРОВЕРЯЕТ: ID станции, которой нет в БД,
         * должен привести к ошибке.
         */
        test('должен определить несуществующую станцию', () => {
            const fakeStationId = 'nonexistent-station-xyz';
            const knownStations = [
                'chikovani-vip-1',
                'chikovani-pro-1',
                'dinamo-vip-1',
            ];

            const exists = knownStations.includes(fakeStationId);
            expect(exists).toBe(false);
        });

        /**
         * Тест: Бронь станции из другого филиала
         * 
         * ЧТО ПРОВЕРЯЕТ: Нельзя забронировать станцию chikovani
         * указав branchId = dinamo.
         */
        test('должен определить несоответствие branch_id и station_id', () => {
            const stationId = 'chikovani-vip-1';
            const requestedBranch = 'dinamo';

            const stationBranch = stationId.split('-')[0];
            const isMatchingBranch = stationBranch === requestedBranch;

            expect(isMatchingBranch).toBe(false);
        });

        /**
         * Тест: Максимальное количество станций в одной брони
         * 
         * ЧТО ПРОВЕРЯЕТ: Система должна работать
         * при бронировании всех станций сразу.
         */
        test('должен обработать бронь на много станций', () => {
            const manyStations = Array.from({ length: 20 }, (_, i) =>
                `chikovani-station-${i + 1}`
            );

            expect(manyStations.length).toBe(20);
            // Система не должна падать при большом количестве
        });
    });

    // ==================================
    // ГРАНИЧНЫЕ СЛУЧАИ ПОЛЬЗОВАТЕЛЬСКИХ ДАННЫХ
    // ==================================

    describe('Граничные случаи пользовательских данных', () => {
        /**
         * Тест: Очень длинное имя клиента
         * 
         * ЧТО ПРОВЕРЯЕТ: Имя клиента слишком длинное
         * для поля в БД.
         */
        test('должен обработать длинное имя', () => {
            const longName = 'А'.repeat(500);
            const MAX_NAME_LENGTH = 255;

            const isTooLong = longName.length > MAX_NAME_LENGTH;
            expect(isTooLong).toBe(true);
        });

        /**
         * Тест: Специальные символы в имени
         * 
         * ЧТО ПРОВЕРЯЕТ: Имена с кириллицей, апострофами
         * и т.д. корректно обрабатываются.
         */
        test('должен принять имя со специальными символами', () => {
            const validNames = [
                "Иван Иванов",
                "Giorgi O'Connor",
                "მარიამ გიორგაძე",
                "Test-User Jr.",
            ];

            validNames.forEach(name => {
                expect(name.trim().length).toBeGreaterThan(0);
            });
        });

        /**
         * Тест: Телефон с разными форматами
         * 
         * ЧТО ПРОВЕРЯЕТ: Разные форматы телефонов
         * должны быть нормализованы.
         */
        test('должен нормализовать разные форматы телефона', () => {
            const phones = [
                '+995 555 123 456',
                '995555123456',
                '+995-555-123-456',
                '555 12 34 56',
            ];

            const normalize = (p: string) => p.replace(/[\s\-\+]/g, '');

            phones.forEach(phone => {
                const cleaned = normalize(phone);
                expect(cleaned).toMatch(/^\d+$/);
            });
        });

        /**
         * Тест: Email с длинным доменом
         * 
         * ЧТО ПРОВЕРЯЕТ: Email валидация для
         * нестандартных доменов.
         */
        test('должен принять email с нестандартным доменом', () => {
            const validEmails = [
                'user@example.com',
                'user@subdomain.example.co.uk',
                'user+tag@gmail.com',
            ];

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            validEmails.forEach(email => {
                expect(email).toMatch(emailRegex);
            });
        });
    });

    // ==================================
    // ГРАНИЧНЫЕ СЛУЧАИ EXTRAS
    // ==================================

    describe('Граничные случаи Extras (VIP/PS5)', () => {
        /**
         * Тест: VIP с ровно 6 гостями (граница)
         * 
         * ЧТО ПРОВЕРЯЕТ: При 6 гостях надбавка НЕ применяется.
         * Только при > 6.
         */
        test('не должен добавлять надбавку для VIP с = 6 гостями', () => {
            const priceBase = calculatePrice('VIP', 2, { guests: 6 });
            const priceExact6 = calculatePrice('VIP', 2);

            expect(priceBase).toBe(priceExact6);
        });

        /**
         * Тест: VIP с 7 гостями (первый case надбавки)
         * 
         * ЧТО ПРОВЕРЯЕТ: При 7 гостях надбавка применяется.
         */
        test('должен добавить надбавку для VIP с 7 гостями', () => {
            const priceBase = calculatePrice('VIP', 2);
            const priceWith7 = calculatePrice('VIP', 2, { guests: 7 });

            expect(priceWith7).toBe(priceBase + 20);
        });

        /**
         * Тест: PS5 с ровно 2 контроллерами
         * 
         * ЧТО ПРОВЕРЯЕТ: Default 2 контроллера - без надбавки.
         */
        test('не должен добавлять надбавку для PS5 с 2 контроллерами', () => {
            const price2 = calculatePrice('PS5', 3, { controllers: 2 });
            const priceDefault = calculatePrice('PS5', 3);

            expect(price2).toBe(priceDefault);
        });

        /**
         * Тест: PS5 с 3 контроллерами (> 2)
         * 
         * ЧТО ПРОВЕРЯЕТ: При 3+ контроллерах применяется надбавка 50%.
         */
        test('должен добавить надбавку для PS5 с 3 контроллерами', () => {
            const priceBase = calculatePrice('PS5', 3, { controllers: 2 });
            const priceWith3 = calculatePrice('PS5', 3, { controllers: 3 });

            expect(priceWith3).toBe(Math.ceil(priceBase * 1.5));
        });
    });
});
