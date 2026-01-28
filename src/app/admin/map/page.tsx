'use client';

import { useState, useEffect } from 'react';
import FloorMap from '@/components/booking/FloorMap';
import BookingActionModal from '@/components/admin/BookingActionModal';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';

export default function AdminMapPage() {
    const [activeBranch, setActiveBranch] = useState<'dinamo' | 'chikovani'>('dinamo');
    const [unavailableIds, setUnavailableIds] = useState<string[]>([]);
    const [bookings, setBookings] = useState<Database['public']['Tables']['bookings']['Row'][]>([]);

    // Multi-select State
    const [selectedStations, setSelectedStations] = useState<string[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStationId, setSelectedStationId] = useState<string | null>(null); // For single edit
    const [selectedBooking, setSelectedBooking] = useState<Database['public']['Tables']['bookings']['Row'] | null>(null);

    const supabase = createClientComponentClient<Database>();

    const fetchAvailability = async () => {
        const now = new Date().toISOString();
        const { data } = await supabase
            .from('bookings')
            .select('*')
            .neq('status', 'CANCELLED')
            .lte('start_time', now)
            .gte('end_time', now);

        if (data) {
            const activeBookings = data as Database['public']['Tables']['bookings']['Row'][];
            setUnavailableIds(activeBookings.map(b => b.station_id));
            setBookings(activeBookings);
        }
    };

    useEffect(() => {
        fetchAvailability();
        const channel = supabase
            .channel('schema-db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchAvailability())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleStationClick = async (id: string, type: string) => {
        const activeBooking = bookings.find(b => b.station_id === id);

        if (activeBooking) {
            // Edit existing booking
            setSelectedStationId(id);
            setSelectedBooking(activeBooking);
            setIsModalOpen(true);
            setSelectedStations([]); // Clear selection if editing specific
        } else {
            // Toggle selection for new booking
            setSelectedStations(prev => {
                const isSelected = prev.includes(id);
                if (isSelected) return prev.filter(sid => sid !== id);
                return [...prev, id];
            });
            setSelectedStationId(null);
            setSelectedBooking(null);
        }
    };

    const handleCreateGroupBooking = () => {
        if (selectedStations.length === 0) return;
        setIsModalOpen(true);
    };

    return (
        <div className="h-full flex flex-col space-y-4 relative">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Live Map Control</h1>
                <div className="flex gap-2 bg-[#111] p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => { setActiveBranch('dinamo'); setSelectedStations([]); }}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeBranch === 'dinamo' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Dinamo
                    </button>
                    <button
                        onClick={() => { setActiveBranch('chikovani'); setSelectedStations([]); }}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeBranch === 'chikovani' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Chikovani
                    </button>
                </div>
            </div>

            {/* Legend Row */}
            <div className="flex flex-wrap gap-4 items-center px-2 py-1 bg-black/50 rounded-lg border border-white/5 w-fit">
                <div className="flex items-center gap-2 text-xs text-white">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white">
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]" />
                    <span>Occupied Now</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white">
                    <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_5px_white]" />
                    <span>Selected</span>
                </div>
            </div>

            <div className="flex-1 bg-[#111] border border-white/10 rounded-xl overflow-hidden relative p-4 overflow-y-auto">
                <FloorMap
                    branchId={activeBranch}
                    selectedSeats={selectedStations}
                    unavailableIds={unavailableIds}
                    onToggle={handleStationClick}
                    isAdmin={true}
                />
            </div>

            {/* Floating Action Button for Group Booking */}
            {selectedStations.length > 0 && (
                <div className="absolute bottom-8 right-12 z-50">
                    <button
                        onClick={handleCreateGroupBooking}
                        className="bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-6 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center gap-2 transform transition-all hover:scale-105 active:scale-95"
                    >
                        <span>Create Booking</span>
                        <span className="bg-black/20 px-2 py-0.5 rounded-full text-xs">
                            {selectedStations.length}
                        </span>
                    </button>
                </div>
            )}

            {isModalOpen && (
                <BookingActionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    stationId={selectedStationId}
                    // @ts-ignore - We will add this prop next
                    stationIds={selectedStations}
                    branchId={activeBranch}
                    existingBooking={selectedBooking}
                    onSuccess={() => {
                        fetchAvailability();
                        setSelectedStations([]); // Clear selection after success
                        setIsModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}
