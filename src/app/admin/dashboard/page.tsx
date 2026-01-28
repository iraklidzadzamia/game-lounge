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

    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL', 'PS5', 'VIP', 'PRO', 'PREMIUM', 'STANDARD'

    const fetchBookings = async () => {
        setLoading(true);

        let query = supabase
            .from('bookings')
            .select(`
                *,
                stations!inner (
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

        // Search Filter
        if (searchQuery) {
            query = query.or(`customer_name.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%`);
        }

        // Type Filter (Note: Requires !inner join which is set in select)
        if (typeFilter !== 'ALL') {
            query = query.eq('stations.type', typeFilter);
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

        // Fetch ALL bookings for today to calculate stats
        const { data: todayBookings } = await supabase
            .from('bookings')
            .select('total_price, customer_phone, station_id, stations (name)')
            .gte('start_time', todayStr)
            .neq('status', 'CANCELLED');

        if (todayBookings) {
            const bookings = todayBookings as any[];
            const revenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
            const uniqueClients = new Set(bookings.map(b => b.customer_phone)).size;
            const stationCounts: Record<string, number> = {};
            bookings.forEach(b => {
                const name = b.stations?.name || b.station_id;
                stationCounts[name] = (stationCounts[name] || 0) + 1;
            });
            const popularStation = Object.entries(stationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
            setStats({ revenue, clients: uniqueClients, popularStation });
        }
    };

    // Grouping Logic
    const groupBookings = (rawBookings: Booking[]) => {
        const groups: Record<string, any> = {};

        rawBookings.forEach(booking => {
            // Key: Phone + StartTime + EndTime (Heuristic for same group)
            const key = `${booking.customer_phone}-${booking.start_time}-${booking.end_time}`;

            if (!groups[key]) {
                groups[key] = {
                    ...booking,
                    isGroup: false,
                    subBookings: [booking],
                    stationNames: [booking.stations?.name || booking.station_id],
                    totalGroupPrice: booking.total_price || 0
                };
            } else {
                groups[key].isGroup = true;
                groups[key].subBookings.push(booking);
                groups[key].stationNames.push(booking.stations?.name || booking.station_id);
                groups[key].totalGroupPrice += (booking.total_price || 0);
            }
        });

        return Object.values(groups);
    };

    useEffect(() => {
        // Debounce search slightly or just run
        const timeout = setTimeout(() => {
            fetchBookings();
        }, 300);
        return () => clearTimeout(timeout);
    }, [filter, searchQuery, typeFilter]);

    // Initial stats fetch only needed once or on filter change? 
    // Usually stats are for "Today" globally, but maybe update if needed. 
    // We'll keep it tied to load for now.
    useEffect(() => {
        fetchStats();
    }, []);

    const groupedData = groupBookings(bookings);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>

                    {/* Filter Tabs */}
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

                {/* Search & Type Filters Bar */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search by Name or Phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Type Filters (Scrollable on mobile) */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {['ALL', 'PS5', 'VIP', 'PRO', 'PREMIUM', 'STANDARD'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold font-orbitron tracking-wider whitespace-nowrap border transition-all ${typeFilter === type
                                    ? 'bg-white text-black border-white'
                                    : 'bg-[#111] text-gray-400 border-white/10 hover:text-white hover:border-white/30'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Cards (Keep existing) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-auto">
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
            </div>

            <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
                {/* Pass grouped data to table */}
                <BookingsTable bookings={groupedData as any} isLoading={loading} onRefresh={() => { fetchBookings(); fetchStats(); }} />
            </div>
        </div>
    );
}
