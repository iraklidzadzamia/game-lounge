
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // or SERVICE_ROLE if needed, but ANON is what client uses

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    // 01:52 Tbilisi (Jan 28) = 21:52 UTC (Jan 27)
    const startTime = '2026-01-27T21:52:00.000Z'; // Jan 27, 21:52 UTC
    const endTime = '2026-01-28T00:52:00.000Z';   // Jan 28, 00:52 UTC

    console.log("Checking availability for:");
    console.log("Start (UTC):", startTime);
    console.log("End (UTC):", endTime);

    const { data: conflicts, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('station_id', 'pc-2-r-1')
        .lt('start_time', endTime)
        .gt('end_time', startTime);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Conflicts found:", conflicts);
        // Also dump all bookings for this station to be sure
        const { data: all } = await supabase
            .from('bookings')
            .select('*')
            .eq('station_id', 'pc-2-r-1');
        console.log("All bookings for pc-2-r-1:", all);
    }
}

check();
