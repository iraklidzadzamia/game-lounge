
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculatePrice, StationType } from '@/config/pricing';

// Helper to deduce type from ID (since we don't query DB for type here to save time)
// In a real robust app, we should fetch station type from DB. 
// For now, we trust the naming convention or fetch. Let's fetch to be safe.
const getStationType = async (id: string) => {
    const { data } = await supabase.from('stations').select('type').eq('id', id).single();
    return data?.type || 'PRO'; // Default fallback
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { startTime, endTime, stationIds, customerName, customerPhone, customerEmail, duration } = body;

        // 1. Basic Validation
        if (!startTime || !endTime || !stationIds || !stationIds.length || !customerName || !customerPhone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const start = new Date(startTime).toISOString();
        const end = new Date(endTime).toISOString();

        // 2. Race Condition Check (Double Check Availability)
        const { data: conflicts } = await supabase
            .from('bookings')
            .select('station_id')
            .in('station_id', stationIds)
            .eq('status', 'CONFIRMED')
            .lt('start_time', end)
            .gt('end_time', start);

        if (conflicts && conflicts.length > 0) {
            return NextResponse.json({
                error: 'One or more stations became unavailable. Please refresh.',
                conflicts: conflicts.map((c: any) => c.station_id)
            }, { status: 409 });
        }

        // 3. Prepare Inserts
        const bookingsToInsert = await Promise.all(stationIds.map(async (id: string) => {
            const type = await getStationType(id);
            const price = calculatePrice(type as StationType, duration);

            return {
                station_id: id,
                start_time: start,
                end_time: end,
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_email: customerEmail,
                total_price: price,
                status: 'CONFIRMED'
            };
        }));

        // 4. Insert into DB
        const { data, error } = await supabase
            .from('bookings')
            .insert(bookingsToInsert)
            .select();

        if (error) {
            console.error('Booking Insert Error:', error);
            return NextResponse.json({ error: 'Failed to save booking' }, { status: 500 });
        }

        return NextResponse.json({ success: true, daa: data });

    } catch (err) {
        console.error('Server error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
