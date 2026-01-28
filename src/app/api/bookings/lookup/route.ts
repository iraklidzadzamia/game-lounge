
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
        return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Clean phone number (basic) - remove spaces, dashes
    const cleanPhone = phone.replace(/[\s-]/g, '');

    if (cleanPhone.length < 4) {
        return NextResponse.json({ error: 'Phone number too short' }, { status: 400 });
    }

    try {
        const now = new Date().toISOString();

        // Fetch active/future bookings
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
                *,
                stations (
                    name,
                    branch_id,
                    type
                )
            `)
            .ilike('customer_phone', `%${cleanPhone}%`)
            .gte('start_time', now) // Only future bookings
            .neq('status', 'CANCELLED')
            .order('start_time', { ascending: true });

        if (error) {
            console.error('Lookup Error:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        return NextResponse.json({ bookings });

    } catch (err) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
