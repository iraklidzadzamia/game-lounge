'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import BookingsTable from '@/components/admin/BookingsTable';
import { Database } from '@/types/database.types';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
    stations: Database['public']['Tables']['stations']['Row'] | null;
};

export default function AdminDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('upcoming'); // 'all', 'upcoming', 'past'
    const supabase = createClientComponentClient<Database>();

    const fetchBookings = async () => {
        setLoading(true);

        let query = supabase
            .from('bookings')
            .select(`
        *,
        stations (
          name,
          branch_id,
          type
        )
      `)
            .order('start_time', { ascending: false });

        if (filter === 'upcoming') {
            const now = new Date().toISOString();
            query = query.gte('start_time', now);
        } else if (filter === 'live') {
            const now = new Date().toISOString();
            query = query.lte('start_time', now).gte('end_time', now).neq('status', 'CANCELLED');
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching bookings:', error);
        } else {
            setBookings(data as any);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBookings();
    }, [filter]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>

                <div className="flex bg-[#111] p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setFilter('live')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${filter === 'live'
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                            : 'text-red-500 hover:bg-red-500/10'
                            }`}
                    >
                        <span className={`w-2 h-2 rounded-full bg-current ${filter === 'live' ? 'animate-pulse' : ''}`} />
                        Live
                    </button>
                    <div className="w-px bg-white/10 mx-1" />
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === 'upcoming'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === 'past'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        History
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === 'all'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        All Time
                    </button>
                </div>
            </div>

            <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
                <BookingsTable bookings={bookings} isLoading={loading} onRefresh={fetchBookings} />
            </div>
        </div>
    );
}
