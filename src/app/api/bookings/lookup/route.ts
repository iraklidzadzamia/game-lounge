
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
        return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Clean phone number - remove everything except digits and +
    const cleanPhone = phone.replace(/[^\d+]/g, '');

    // Sanitize against SQL wildcards (IDOR protection)
    const sanitizedPhone = cleanPhone.replace(/[%_]/g, '');

    // Require minimum 9 digits for security
    const digitsOnly = sanitizedPhone.replace(/\D/g, '');
    if (digitsOnly.length < 9) {
        return NextResponse.json({ error: 'Please enter at least 9 digits of your phone number' }, { status: 400 });
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
            .ilike('customer_phone', `%${sanitizedPhone}`)
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
