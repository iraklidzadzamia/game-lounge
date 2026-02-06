
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculatePrice, StationType } from '@/config/pricing';

/**
 * Получить тип станции по ID
 * Оптимизировано: batch-запрос вместо N+1
 */
const getStationTypes = async (ids: string[]): Promise<Record<string, StationType>> => {
    const { data } = await supabase
        .from('stations')
        .select('id, type')
        .in('id', ids);

    const typeMap: Record<string, StationType> = {};
    data?.forEach((s: { id: string; type: string }) => {
        typeMap[s.id] = (s.type as StationType) || 'PRO';
    });
    return typeMap;
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { startTime, endTime, stationIds, customerName, customerPhone, customerEmail, duration, branchId, guestCount, controllersCount } = body;

        // =====================
        // 1. БАЗОВАЯ ВАЛИДАЦИЯ
        // =====================
        if (!startTime || !endTime || !stationIds || !stationIds.length || !customerName || !customerPhone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = new Date();

        // =====================
        // 2. ВАЛИДАЦИЯ ВРЕМЕНИ (НОВОЕ!)
        // =====================

        // 2.1 Время начала не в прошлом (допуск 5 минут для сетевых задержек)
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        if (start < fiveMinutesAgo) {
            return NextResponse.json({
                error: 'Cannot book in the past'
            }, { status: 400 });
        }

        // 2.2 Время окончания после времени начала
        if (end <= start) {
            return NextResponse.json({
                error: 'End time must be after start time'
            }, { status: 400 });
        }

        // 2.3 Минимальная длительность 30 минут
        const durationMs = end.getTime() - start.getTime();
        if (durationMs < 30 * 60 * 1000) {
            return NextResponse.json({
                error: 'Minimum booking duration is 30 minutes'
            }, { status: 400 });
        }

        // 2.4 Максимальная длительность 12 часов
        if (durationMs > 12 * 60 * 60 * 1000) {
            return NextResponse.json({
                error: 'Maximum booking duration is 12 hours'
            }, { status: 400 });
        }

        // 2.5 Бронирование не более чем на 30 дней вперёд
        const maxFutureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        if (start > maxFutureDate) {
            return NextResponse.json({
                error: 'Cannot book more than 30 days in advance'
            }, { status: 400 });
        }

        const startISO = start.toISOString();
        const endISO = end.toISOString();
        const branch = branchId || 'chikovani';

        // =====================
        // 3. ПРОВЕРКА КОНФЛИКТОВ
        // =====================
        const { data: conflicts, error: conflictError } = await supabase
            .from('bookings')
            .select('station_id')
            .in('station_id', stationIds)
            .eq('branch_id', branch)
            .eq('status', 'CONFIRMED')
            .lt('start_time', endISO)
            .gt('end_time', startISO);

        if (conflictError) {
            console.error('Conflict check error:', conflictError);
            return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 });
        }

        if (conflicts && conflicts.length > 0) {
            return NextResponse.json({
                error: 'One or more stations became unavailable. Please refresh.',
                conflicts: conflicts.map((c: { station_id: string }) => c.station_id)
            }, { status: 409 });
        }

        // =====================
        // 4. ПОЛУЧЕНИЕ ТИПОВ СТАНЦИЙ (ОПТИМИЗИРОВАНО)
        // =====================
        const stationTypes = await getStationTypes(stationIds);

        // =====================
        // 5. ПОДГОТОВКА ДАННЫХ ДЛЯ ВСТАВКИ
        // =====================
        const bookingsToInsert = stationIds.map((id: string) => {
            const type = stationTypes[id] || 'PRO';
            const price = calculatePrice(type, duration, {
                guests: guestCount,
                controllers: controllersCount
            });

            return {
                station_id: id,
                branch_id: branch,
                start_time: startISO,
                end_time: endISO,
                customer_name: customerName.trim(),
                customer_phone: customerPhone.trim(),
                customer_email: customerEmail?.trim() || null,
                total_price: price,
                status: 'CONFIRMED',
                guest_count: guestCount || 1,
                controllers_count: controllersCount || 2
            };
        });

        // =====================
        // 6. ВСТАВКА В БД
        // =====================
        // Supabase insert - если любая вставка провалится, все откатятся
        // (Supabase использует транзакции для batch insert)
        const { data, error } = await supabase
            .from('bookings')
            .insert(bookingsToInsert)
            .select();

        if (error) {
            console.error('Booking Insert Error:', error);

            // Проверка на уникальность (race condition caught by DB)
            if (error.code === '23505') {
                return NextResponse.json({
                    error: 'This time slot just became unavailable. Please try another time.'
                }, { status: 409 });
            }

            return NextResponse.json({ error: 'Failed to save booking' }, { status: 500 });
        }

        // =====================
        // 7. УСПЕШНЫЙ ОТВЕТ (ИСПРАВЛЕНО: daa -> data)
        // =====================
        return NextResponse.json({
            success: true,
            data: data,  // ← ИСПРАВЛЕНО: было "daa"
            bookingCount: data?.length || 0
        });

    } catch (err) {
        console.error('Server error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
