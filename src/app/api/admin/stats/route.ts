
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Auth Check (Optional but recommended for consistency, though middleware handles it mostly)
        // const supabaseAuth = createRouteHandlerClient({ cookies });
        // const { data: { session } } = await supabaseAuth.auth.getSession();
        // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const url = new URL(request.url);
        const branchId = url.searchParams.get('branchId') || 'chikovani';
        const queryDateStr = url.searchParams.get('date'); // YYYY-MM-DD



        // 1. Fetch Today's Revenue and Count (Standard Stats)
        // Get start of today in UTC
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const startOfDayISO = todayStart.toISOString();

        let todayQuery = supabase
            .from('bookings')
            .select('total_price, start_time, end_time, payment_status')
            .gte('start_time', startOfDayISO)
            .eq('payment_status', 'paid'); // Only count paid bookings

        if (branchId !== 'all') {
            todayQuery = todayQuery.eq('branch_id', branchId);
        }

        const { data: todayBookings } = await todayQuery;

        const dailyRevenue = todayBookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
        const totalBookingsToday = todayBookings?.length || 0;

        // 2. Fetch Specific Date Revenue (if requested)
        let specificDateRevenue = null;
        if (queryDateStr) {
            const specificStart = new Date(queryDateStr);
            specificStart.setHours(0, 0, 0, 0);
            const specificEnd = new Date(specificStart);
            specificEnd.setDate(specificEnd.getDate() + 1);

            let historicalQuery = supabase
                .from('bookings')
                .select('total_price')
                .gte('start_time', specificStart.toISOString())
                .lt('start_time', specificEnd.toISOString());

            if (branchId !== 'all') {
                historicalQuery = historicalQuery.eq('branch_id', branchId);
            }

            const { data: historical } = await historicalQuery;

            specificDateRevenue = historical?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
        }

        // 3. Active Now
        const currentIso = new Date().toISOString();
        let activeQuery = supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .lt('start_time', currentIso)
            .gt('end_time', currentIso);

        if (branchId !== 'all') {
            activeQuery = activeQuery.eq('branch_id', branchId);
        }

        const { count: activeNow } = await activeQuery;

        // 4. Weekly Revenue (Optional, user didn't want graph but maybe summary?)
        // Let's keep it minimal for now based on request.

        return NextResponse.json({
            dailyRevenue,
            totalBookingsToday,
            activeNow: activeNow || 0,
            specificDateRevenue
        });

    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
