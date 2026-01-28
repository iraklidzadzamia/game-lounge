'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';

type Booking = Database['public']['Tables']['bookings']['Row'];

interface BookingActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    stationId?: string | null; // Optional now, used for single edit
    stationIds?: string[];     // New prop for multi-select
    branchId: string;
    onSuccess: () => void;
    existingBooking?: Booking | null; // If editing
}

export default function BookingActionModal({
    isOpen,
    onClose,
    stationId,
    stationIds = [],
    branchId,
    onSuccess,
    existingBooking
}: BookingActionModalProps) {
    const supabase = createClientComponentClient<Database>();
    const [loading, setLoading] = useState(false);

    // Determine target stations
    const targetStationIds = stationIds && stationIds.length > 0
        ? stationIds
        : (stationId ? [stationId] : []);

    const isGroupBooking = targetStationIds.length > 1;

    // Form State
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [startTime, setStartTime] = useState('');
    const [duration, setDuration] = useState('60'); // minutes
    const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('unpaid');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card_bog' | 'card_tbc' | null>(null);
    const [notes, setNotes] = useState('');

    // Reset or Populate form
    useEffect(() => {
        if (isOpen) {
            if (existingBooking) {
                setCustomerName(existingBooking.customer_name);
                setCustomerPhone(existingBooking.customer_phone);
                // Format for datetime-local input: YYYY-MM-DDTHH:mm
                const start = new Date(existingBooking.start_time);
                start.setMinutes(start.getMinutes() - start.getTimezoneOffset());
                setStartTime(start.toISOString().slice(0, 16));

                const durationMin = Math.round(
                    (new Date(existingBooking.end_time).getTime() - new Date(existingBooking.start_time).getTime()) / 60000
                );
                setDuration(durationMin.toString());
                setPaymentStatus(existingBooking.payment_status || 'unpaid');
                setPaymentMethod(existingBooking.payment_method || null);
                setNotes(existingBooking.notes || '');
            } else {
                // Defaults for new booking
                setCustomerName('');
                setCustomerPhone('');
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                now.setSeconds(0);
                now.setMilliseconds(0);
                setStartTime(now.toISOString().slice(0, 16));
                setDuration('60');
                setPaymentStatus('unpaid');
                setPaymentMethod(null);
                setNotes('');
            }
        }
    }, [isOpen, existingBooking]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (targetStationIds.length === 0 || !startTime) return;
        setLoading(true);

        const start = new Date(startTime);
        const end = new Date(start.getTime() + parseInt(duration) * 60000);

        try {
            if (existingBooking) {
                // Edit Single Booking
                const bookingData = {
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    start_time: start.toISOString(),
                    end_time: end.toISOString(),
                    payment_status: paymentStatus,
                    payment_method: paymentMethod || null,
                    notes: notes,
                };

                const { error } = await supabase
                    .from('bookings')
                    // @ts-ignore
                    .update(bookingData)
                    .eq('id', existingBooking.id);

                if (error) throw error;

            } else {
                // Create New Booking(s)

                // 1. Check Conflicts for ALL stations
                const { data: conflicts, error: checkError } = await supabase
                    .from('bookings')
                    .select('id, station_id')
                    .in('station_id', targetStationIds)
                    .neq('status', 'CANCELLED')
                    .or(`and(start_time.lte.${end.toISOString()},end_time.gte.${start.toISOString()})`);

                if (checkError) throw checkError;

                if (conflicts && conflicts.length > 0) {
                    // Filter out conflicts that are just touching boundaries if needed, but the query usually handles strict overlaps
                    const conflictedStations = (conflicts as any[]).map(c => c.station_id);
                    // Just basic error for now
                    throw new Error(`Conflict detected! Stations ${conflictedStations.join(', ')} are already booked.`);
                }

                // 2. Prepare Insert Data
                const newBookings = targetStationIds.map(sid => ({
                    station_id: sid,
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    start_time: start.toISOString(),
                    end_time: end.toISOString(),
                    payment_status: paymentStatus,
                    payment_method: paymentMethod || null,
                    notes: notes,
                    status: 'CONFIRMED'
                }));

                const { error } = await supabase
                    .from('bookings')
                    // @ts-ignore
                    .insert(newBookings);

                if (error) throw error;
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!existingBooking) return;
        if (!confirm("Are you sure you want to delete this booking?")) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('bookings').delete().eq('id', existingBooking.id);
            if (error) throw error;
            onSuccess();
            onClose();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-lg font-bold text-white">
                        {existingBooking
                            ? 'Edit Booking'
                            : isGroupBooking
                                ? `New Group Booking (${targetStationIds.length})`
                                : 'New Booking'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    {/* Station Info */}
                    <div className="text-sm text-gray-400 mb-2">
                        {isGroupBooking ? (
                            <div>
                                Packing <span className="text-blue-400 font-bold">{targetStationIds.length} Stations</span>
                                <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                                    {targetStationIds.map(id => (
                                        <span key={id} className="bg-white/10 px-1 rounded">{id}</span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div>Station: <span className="text-blue-400 font-bold">{targetStationIds[0]}</span></div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Customer Name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Phone</label>
                            <input
                                type="tel"
                                required
                                className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                                value={customerPhone}
                                onChange={e => setCustomerPhone(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Start Time</label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-xs"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Duration (min)</label>
                            <input
                                type="number"
                                min="30"
                                step="30"
                                required
                                className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                                value={duration}
                                onChange={e => setDuration(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
                        <label className="block text-xs font-semibold text-gray-400 uppercase">Payment</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="payment_status"
                                    checked={paymentStatus === 'unpaid'}
                                    onChange={() => setPaymentStatus('unpaid')}
                                    className="accent-yellow-500"
                                />
                                <span className="text-sm text-yellow-500">Unpaid</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="payment_status"
                                    checked={paymentStatus === 'paid'}
                                    onChange={() => setPaymentStatus('paid')}
                                    className="accent-green-500"
                                />
                                <span className="text-sm text-green-500">Paid</span>
                            </label>
                        </div>

                        {paymentStatus === 'paid' && (
                            <div className="pt-2 border-t border-white/10 animation-fade-in">
                                <label className="block text-xs font-semibold text-gray-500 mb-2">Method</label>
                                <select
                                    required
                                    className="w-full bg-black/50 border border-white/20 rounded px-2 py-1.5 text-sm text-white focus:border-blue-500 outline-none"
                                    value={paymentMethod || ''}
                                    onChange={e => setPaymentMethod(e.target.value as any)}
                                >
                                    <option value="" disabled>Select Method</option>
                                    <option value="cash">Cash 💵</option>
                                    <option value="card_bog">Bank of Georgia 🦁</option>
                                    <option value="card_tbc">TBC Bank 🔵</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Notes</label>
                        <textarea
                            className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-sm h-20"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        {existingBooking && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm font-semibold"
                            >
                                Delete
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all text-sm shadow-lg shadow-blue-500/20"
                        >
                            {loading ? 'Saving...' : existingBooking ? 'Update Booking' : 'Create Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
