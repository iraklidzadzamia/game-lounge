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

    const [stats, setStats] = useState({
        revenue: 0,
        clients: 0,
        popularStation: 'N/A'
    });

    const fetchStats = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString();

        // Fetch ALL bookings for today to calculate stats (ignore current view filter)
        const { data: todayBookings } = await supabase
            .from('bookings')
            .select('total_price, customer_phone, station_id, stations (name)')
            .gte('start_time', todayStr)
            .neq('status', 'CANCELLED');

        if (todayBookings) {
            const bookings = todayBookings as any[];
            // 1. Revenue (Sum of total_price)
            const revenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

            // 2. Total Clients (Unique Phones)
            const uniqueClients = new Set(bookings.map(b => b.customer_phone)).size;

            // 3. Popular Station
            const stationCounts: Record<string, number> = {};
            bookings.forEach(b => {
                const name = b.stations?.name || b.station_id;
                stationCounts[name] = (stationCounts[name] || 0) + 1;
            });
            const popularStation = Object.entries(stationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

            setStats({ revenue, clients: uniqueClients, popularStation });
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchStats();
    }, [filter]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-auto mb-4 md:mb-0">
                    <div className="bg-[#111] border border-white/10 rounded-xl p-4 flex flex-col min-w-[150px]">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Today's Revenue</span>
                        <span className="text-2xl font-bold text-green-400 mt-1">{stats.revenue} ₾</span>
                    </div>
                    <div className="bg-[#111] border border-white/10 rounded-xl p-4 flex flex-col min-w-[150px]">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Active Clients</span>
                        <span className="text-2xl font-bold text-blue-400 mt-1">{stats.clients}</span>
                    </div>
                    <div className="bg-[#111] border border-white/10 rounded-xl p-4 flex flex-col min-w-[150px]">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Popular Station</span>
                        <span className="text-xl font-bold text-purple-400 mt-1 truncate">{stats.popularStation}</span>
                    </div>
                </div>

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
