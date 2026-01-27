
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { startTime, endTime, stationIds } = await request.json();

        if (!startTime || !endTime || !stationIds || !Array.isArray(stationIds)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Convert string dates back to Date objects for comparison logic if needed,
        // but Supabase/Postgres handles ISO strings well.
        const start = new Date(startTime).toISOString();
        const end = new Date(endTime).toISOString();

        // Query for ANY booking that overlaps with this time window for these stations
        // Overlap logic: (BookStart < ReqEnd) AND (BookEnd > ReqStart)
        const { data: conflicts, error } = await supabase
            .from('bookings')
            .select('station_id')
            .in('station_id', stationIds)
            .eq('status', 'CONFIRMED') // Only check confirmed bookings
            .lt('start_time', end)
            .gt('end_time', start);

        if (error) {
            console.error('Availability check error:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // Extract IDs of unavailable stations
        const unavailableStationIds = conflicts?.map((b: any) => b.station_id) || [];
        const uniqueUnavailable = Array.from(new Set(unavailableStationIds));

        return NextResponse.json({ unavailable: uniqueUnavailable });

    } catch (err) {
        console.error('Server error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
