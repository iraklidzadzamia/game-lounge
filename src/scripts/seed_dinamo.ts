
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Using Anon key might be limited if RLS is on. 
// Ideally should use SERVICE_ROLE_KEY for seeding but I might not have it.
// If RLS is public insert allowed (which it might be for bookings, but stations?), I can try.
// If not, I need the user to run SQL.
// Let's assume user has permissions or I can use the existing client if it has rights.
// Actually, `src/lib/supabase.ts` uses the anon key.
// If I can't insert stations with anon key, I'll have to ask user to run SQL.

const supabase = createClient(supabaseUrl, supabaseKey);

const stations = [
    { id: 'vip-1', name: 'VIP 1', type: 'VIP' },
    { id: 'vip-2', name: 'VIP 2', type: 'VIP' },
];

// Floor 2
for (let i = 1; i <= 5; i++) stations.push({ id: `pc-2-l-${i}`, name: `PC ${i}`, type: 'PREMIUM' });
for (let i = 1; i <= 5; i++) stations.push({ id: `pc-2-c-${i}`, name: `PC ${i + 5}`, type: 'PRO' });
for (let i = 1; i <= 6; i++) stations.push({ id: `pc-2-r-${i}`, name: `PC ${i + 10}`, type: 'PRO' });

// Floor 3
for (let i = 1; i <= 5; i++) stations.push({ id: `pc-3-l-${i}`, name: `PC ${i}`, type: 'PREMIUM' });
for (let i = 1; i <= 5; i++) stations.push({ id: `pc-3-c-${i}`, name: `PC ${i + 5}`, type: 'PRO' });
for (let i = 1; i <= 6; i++) stations.push({ id: `pc-3-r-${i}`, name: `PC ${i + 10}`, type: 'PRO' });

async function seed() {
    console.log(`Seeding ${stations.length} stations for Dinamo branch...`);

    const branchId = 'dinamo';

    const rows = stations.map(s => ({
        id: `${branchId}-${s.id}`,
        name: s.name,
        type: s.type,
        branch_id: branchId
    }));

    const { error } = await supabase.from('stations').upsert(rows);

    if (error) {
        console.error('Error seeding stations:', error);
    } else {
        console.log('Success!');
    }
}

seed();
