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

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Database['public']['Tables']['bookings']['Row'] | null>(null);

    const supabase = createClientComponentClient<Database>();

    // Use a simpler approach than parsing huge availability logic
    // Just fetch all ACTIVE bookings for now + next 24h
    // Admin Map might need to see "Who is sitting there NOW?" vs "Is it booked?"
    // Let's assume the map shows CURRENT status + Click allows details.

    const fetchAvailability = async () => {
        const now = new Date().toISOString();
        // Get bookings that are currently active OR starting soon?
        // Let's just visualize "Occupied right now" for the red dots?
        // User probably wants to see future bookings too if he clicks?
        // The "red dot" usually means "unavailable for new booking right now".

        // Simplification: Red dot = Booked NOW (Active).
        // Or Red dot = Has booking overlapping current selection? 
        // In Admin Mode, let's make Red = Occupied NOW. 

        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .neq('status', 'CANCELLED')
            .lte('start_time', now)
            .gte('end_time', now); // Actually active right now

        if (data) {
            const activeBookings = data as Database['public']['Tables']['bookings']['Row'][];
            setUnavailableIds(activeBookings.map(b => b.station_id));
            setBookings(activeBookings);
        }
    };

    useEffect(() => {
        fetchAvailability();

        // Realtime subscription could go here
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings',
                },
                (payload) => {
                    fetchAvailability();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleStationClick = async (id: string, type: string) => {
        // Check if there is an active booking for this station to Edit
        // We already fetched active bookings in `bookings` state
        // But we might want to let admin create a future booking too?
        // If clicked, open modal. 
        // If active booking exists -> Edit Mode.
        // If no active booking -> Create Mode (defaults to Now).

        const activeBooking = bookings.find(b => b.station_id === id);

        // Also, maybe we want to search for *future* bookings if not active?
        // For now, let's just handle "Current Active" editing or "New" creation.
        // If they want to edit a future one, they use Dashboard Table or we add a "See Schedule" feature later.

        setSelectedStationId(id);
        setSelectedBooking(activeBooking || null);
        setIsModalOpen(true);
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Live Map Control</h1>
                <div className="flex gap-2 bg-[#111] p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setActiveBranch('dinamo')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeBranch === 'dinamo'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Dinamo
                    </button>
                    <button
                        onClick={() => setActiveBranch('chikovani')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeBranch === 'chikovani'
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}
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
                <div className="flex items-center gap-2 ml-2 text-xs text-gray-400 italic">
                    <span>(Click any station to Manage)</span>
                </div>
            </div>

            <div className="flex-1 bg-[#111] border border-white/10 rounded-xl overflow-hidden relative p-4 overflow-y-auto">
                <FloorMap
                    branchId={activeBranch}
                    selectedSeats={[]} // No multi-select for visual
                    unavailableIds={unavailableIds}
                    onToggle={handleStationClick}
                    isAdmin={true}
                />
            </div>

            {isModalOpen && (
                <BookingActionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    stationId={selectedStationId}
                    branchId={activeBranch}
                    existingBooking={selectedBooking}
                    onSuccess={() => {
                        fetchAvailability();
                        // Optionally trigger dashboard refresh?
                    }}
                />
            )}
        </div>
    );
}
