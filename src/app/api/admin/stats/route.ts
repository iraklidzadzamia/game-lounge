
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

        // 1. Fetch Today's Revenue and Count (Standard Stats)
        // Get start of today in UTC
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const startOfDayISO = todayStart.toISOString();

        let todayQuery = supabase
            .from('bookings')
            .select('total_price, start_time, end_time, payment_status, deposit_amount')
            .gte('start_time', startOfDayISO)
            .in('payment_status', ['paid', 'deposit']); // Count paid AND deposit bookings

        if (branchId !== 'all') {
            todayQuery = todayQuery.eq('branch_id', branchId);
        }

        const { data: todayBookings } = await todayQuery;

        // Calculate revenue: for 'paid' use total_price, for 'deposit' use deposit_amount
        const dailyRevenue = todayBookings?.reduce((sum, b) => {
            if (b.payment_status === 'paid') return sum + (b.total_price || 0);
            if (b.payment_status === 'deposit') return sum + (b.deposit_amount || 0);
            return sum;
        }, 0) || 0;
        const totalBookingsToday = todayBookings?.length || 0;

        // 2. Fetch Range Revenue (from-to datetime range)
        let rangeRevenue = null;
        const fromStr = url.searchParams.get('from'); // e.g., 2026-02-07T00:00
        const toStr = url.searchParams.get('to');     // e.g., 2026-02-07T23:59

        if (fromStr && toStr) {
            const fromDate = new Date(fromStr);
            const toDate = new Date(toStr);

            let rangeQuery = supabase
                .from('bookings')
                .select('total_price, payment_status, deposit_amount')
                .gte('start_time', fromDate.toISOString())
                .lte('start_time', toDate.toISOString())
                .in('payment_status', ['paid', 'deposit']);

            if (branchId !== 'all') {
                rangeQuery = rangeQuery.eq('branch_id', branchId);
            }

            const { data: rangeBookings } = await rangeQuery;
            rangeRevenue = rangeBookings?.reduce((sum, b) => {
                if (b.payment_status === 'paid') return sum + (b.total_price || 0);
                if (b.payment_status === 'deposit') return sum + (b.deposit_amount || 0);
                return sum;
            }, 0) || 0;
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
            rangeRevenue
        });

    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
