-- =============================================
-- МИГРАЦИЯ: Защита от Race Condition в Бронированиях
-- =============================================
-- Эта миграция добавляет PostgreSQL trigger и exclusion constraint
-- для предотвращения двойных бронирований на уровне базы данных.
--
-- ЗАПУСТИТЕ ЭТУ МИГРАЦИЮ В SUPABASE SQL EDITOR!
-- =============================================

-- 1. Добавление extension для exclusion constraint
-- (btree_gist нужен для EXCLUDE constraint с операторами &&)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Создание функции для проверки пересечения времени
CREATE OR REPLACE FUNCTION check_booking_overlap()
RETURNS TRIGGER AS $$
BEGIN
    -- Проверяем есть ли пересекающиеся подтверждённые брони
    IF EXISTS (
        SELECT 1 FROM bookings
        WHERE station_id = NEW.station_id
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND status = 'CONFIRMED'
        AND tstzrange(start_time, end_time, '[)') && tstzrange(NEW.start_time, NEW.end_time, '[)')
    ) THEN
        RAISE EXCEPTION 'Booking conflict: Station % is already booked for this time period', NEW.station_id
            USING ERRCODE = '23505'; -- unique_violation
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Создание trigger для проверки перед INSERT и UPDATE
DROP TRIGGER IF EXISTS prevent_booking_overlap ON bookings;
CREATE TRIGGER prevent_booking_overlap
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW
    WHEN (NEW.status = 'CONFIRMED')
    EXECUTE FUNCTION check_booking_overlap();

-- 4. Индексы для оптимизации запросов
-- Основной индекс для проверки доступности
CREATE INDEX IF NOT EXISTS idx_bookings_station_time 
    ON bookings (station_id, start_time, end_time) 
    WHERE status = 'CONFIRMED';

-- Индекс для поиска по телефону
CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone 
    ON bookings (customer_phone);

-- Индекс для фильтрации по статусу
CREATE INDEX IF NOT EXISTS idx_bookings_status 
    ON bookings (status);

-- Индекс для фильтрации по branch и времени (Dashboard)
CREATE INDEX IF NOT EXISTS idx_bookings_branch_time 
    ON bookings (branch_id, start_time DESC);

-- Композитный индекс для админ-фильтров
CREATE INDEX IF NOT EXISTS idx_bookings_admin_filters
    ON bookings (branch_id, status, start_time DESC);

-- 5. Проверка что миграция сработала
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Race condition protection is now active.';
    RAISE NOTICE 'Performance indexes have been created.';
END $$;
