'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import BookingsTable from '@/components/admin/BookingsTable';
import BookingActionModal from '@/components/admin/BookingActionModal';
import { Database } from '@/types/database.types';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
    stations: Database['public']['Tables']['stations']['Row'] | null;
};

export default function AdminDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('upcoming');
    const supabase = createClientComponentClient<Database>();
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [activeBranch, setActiveBranch] = useState<'all' | 'dinamo' | 'chikovani'>('all');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const fetchBookings = async () => {
        setLoading(true);
        let query = supabase.from('bookings').select('*, stations!inner(name, branch_id, type)').order('start_time', { ascending: false });

        if (filter === 'upcoming') query = query.gte('start_time', new Date().toISOString());
        else if (filter === 'live') query = query.lte('start_time', new Date().toISOString()).gte('end_time', new Date().toISOString()).neq('status', 'CANCELLED');

        if (activeBranch !== 'all') query = query.eq('stations.branch_id', activeBranch);

        if (searchQuery) query = query.or(`customer_name.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%`);
        if (typeFilter !== 'ALL') query = query.eq('stations.type', typeFilter);

        const { data, error } = await query;
        if (!error) setBookings(data as any);
        setLoading(false);
    };

    const groupBookings = (rawBookings: Booking[]) => {
        const groups: Record<string, any> = {};
        rawBookings.forEach(booking => {
            const key = `${booking.customer_phone}-${booking.start_time}-${booking.end_time}`;
            if (!groups[key]) {
                groups[key] = { ...booking, isGroup: false, subBookings: [booking], stationNames: [booking.stations?.name || booking.station_id], totalGroupPrice: booking.total_price || 0 };
            } else {
                groups[key].isGroup = true; groups[key].subBookings.push(booking); groups[key].stationNames.push(booking.stations?.name || booking.station_id); groups[key].totalGroupPrice += (booking.total_price || 0);
            }
        });
        return Object.values(groups);
    };

    useEffect(() => {
        const timeout = setTimeout(fetchBookings, 300);
        return () => clearTimeout(timeout);
    }, [filter, searchQuery, typeFilter, activeBranch]);

    const groupedData = groupBookings(bookings);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                        <div className="flex bg-[#111] p-1 rounded-lg border border-white/10">
                            <button
                                onClick={() => setActiveBranch('all')}
                                className={`px-3 py-1 text-xs font-bold rounded transition-all ${activeBranch === 'all' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                            >
                                ALL
                            </button>
                            <button
                                onClick={() => setActiveBranch('dinamo')}
                                className={`px-3 py-1 text-xs font-bold rounded transition-all ${activeBranch === 'dinamo' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                DINAMO
                            </button>
                            <button
                                onClick={() => setActiveBranch('chikovani')}
                                className={`px-3 py-1 text-xs font-bold rounded transition-all ${activeBranch === 'chikovani' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                CHIKOVANI
                            </button>
                        </div>
                    </div>

                    <div className="flex bg-[#111] p-1 rounded-lg border border-white/10">
                        <button onClick={() => setFilter('live')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${filter === 'live' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-red-500 hover:bg-red-500/10'}`}><span className={`w-2 h-2 rounded-full bg-current ${filter === 'live' ? 'animate-pulse' : ''}`} />Live</button>
                        <div className="w-px bg-white/10 mx-1" />
                        <button onClick={() => setFilter('upcoming')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === 'upcoming' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Upcoming</button>
                        <button onClick={() => setFilter('past')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === 'past' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>History</button>
                        <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>All Time</button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <input type="text" placeholder="Search by Name or Phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {['ALL', 'PS5', 'VIP', 'PRO', 'PREMIUM', 'STANDARD']
                            .filter(type => {
                                if (activeBranch === 'dinamo') return !['STANDARD', 'PS5'].includes(type);
                                return true;
                            })
                            .map((type) => (
                                <button key={type} onClick={() => setTypeFilter(type)} className={`px-4 py-2 rounded-lg text-xs font-bold font-orbitron tracking-wider whitespace-nowrap border transition-all ${typeFilter === type ? 'bg-white text-black border-white' : 'bg-[#111] text-gray-400 border-white/10 hover:text-white hover:border-white/30'}`}>{type}</button>
                            ))}
                    </div>
                </div>

                {/* Analytics Dashboard */}
                <AnalyticsDashboard branchId={activeBranch} />
            </div>

            <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
                <BookingsTable
                    bookings={groupedData as any}
                    isLoading={loading}
                    onRefresh={() => fetchBookings()}
                    onEdit={(booking) => {
                        setSelectedBooking(booking);
                        setIsModalOpen(true);
                    }}
                />
            </div>

            {/* Editing Modal */}
            <BookingActionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedBooking(null);
                }}
                branchId="chikovani" // defaulting to chikovani, can be adjustable if needed
                onSuccess={() => {
                    fetchBookings();
                }}
                existingBooking={selectedBooking}
                stationId={selectedBooking?.station_id}
            />
        </div>
    );
}
