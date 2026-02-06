
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * API для отмены бронирования клиентом
 * 
 * Клиент может отменить свою бронь если:
 * - Телефон совпадает с бронированием
 * - Бронирование ещё не началось (минимум 30 минут до начала)
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { bookingId, customerPhone } = body;

        // =====================
        // 1. ВАЛИДАЦИЯ ВХОДНЫХ ДАННЫХ
        // =====================
        if (!bookingId || !customerPhone) {
            return NextResponse.json({
                error: 'Missing required fields: bookingId and customerPhone'
            }, { status: 400 });
        }

        // Очистка телефона
        const cleanPhone = customerPhone.replace(/[^\d+]/g, '');
        const digitsOnly = cleanPhone.replace(/\D/g, '');

        if (digitsOnly.length < 9) {
            return NextResponse.json({
                error: 'Invalid phone number'
            }, { status: 400 });
        }

        // =====================
        // 2. ПОИСК БРОНИРОВАНИЯ
        // =====================
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('id, customer_phone, start_time, status')
            .eq('id', bookingId)
            .single();

        if (fetchError || !booking) {
            return NextResponse.json({
                error: 'Booking not found'
            }, { status: 404 });
        }

        // =====================
        // 3. ПРОВЕРКА ВЛАДЕЛЬЦА
        // =====================
        const bookingPhoneDigits = booking.customer_phone.replace(/\D/g, '');

        // Сравниваем последние 9 цифр (игнорируем код страны)
        if (!bookingPhoneDigits.endsWith(digitsOnly.slice(-9))) {
            return NextResponse.json({
                error: 'Phone number does not match this booking'
            }, { status: 403 });
        }

        // =====================
        // 4. ПРОВЕРКА ВРЕМЕНИ
        // =====================
        if (booking.status === 'CANCELLED') {
            return NextResponse.json({
                error: 'This booking is already cancelled'
            }, { status: 400 });
        }

        const startTime = new Date(booking.start_time);
        const now = new Date();
        const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

        // Нельзя отменить если до начала меньше 30 минут
        if (startTime < thirtyMinutesFromNow) {
            return NextResponse.json({
                error: 'Cannot cancel booking less than 30 minutes before start time'
            }, { status: 400 });
        }

        // =====================
        // 5. ОТМЕНА БРОНИРОВАНИЯ
        // =====================
        const { error: updateError } = await supabase
            .from('bookings')
            .update({
                status: 'CANCELLED',
                notes: `[Cancelled by customer at ${now.toISOString()}]`
            })
            .eq('id', bookingId);

        if (updateError) {
            console.error('Cancel error:', updateError);
            return NextResponse.json({
                error: 'Failed to cancel booking'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Booking cancelled successfully'
        });

    } catch (err) {
        console.error('Server error:', err);
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 });
    }
}
