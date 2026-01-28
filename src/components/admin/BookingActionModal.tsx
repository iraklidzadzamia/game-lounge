'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';
import { calculatePrice, StationType } from '@/config/pricing';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
    stations?: { type: string } | null;
};

interface BookingActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    stationId?: string | null;
    stationIds?: string[];
    branchId: string;
    onSuccess: () => void;
    existingBooking?: Booking | null;
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

    const targetStationIds = stationIds && stationIds.length > 0
        ? stationIds
        : (stationId ? [stationId] : []);

    const isGroupBooking = targetStationIds.length > 1;

    // Form State
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    // Split Date/Time State
    const [startDate, setStartDate] = useState('');
    const [startClock, setStartClock] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endClock, setEndClock] = useState('');

    // Legacy removed: startTime, endTime

    const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('unpaid');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card_bog' | 'card_tbc' | null>(null);
    const [notes, setNotes] = useState('');

    // Generate Time Slots (00:00 - 23:30)
    const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
        const h = Math.floor(i / 2).toString().padStart(2, '0');
        const m = (i % 2 === 0 ? '00' : '30');
        return `${h}:${m}`;
    });

    // New Open/Stop Logic
    const [isOpenSession, setIsOpenSession] = useState(false);
    const [stopMode, setStopMode] = useState(false);

    // Pricing Logic for Stop
    const [finalPrice, setFinalPrice] = useState<number | null>(null);
    const [calculatedActualPrice, setCalculatedActualPrice] = useState<number>(0);
    const [calculatedReservedPrice, setCalculatedReservedPrice] = useState<number>(0);
    const [elapsedMinutes, setElapsedMinutes] = useState(0);
    const [reservedMinutes, setReservedMinutes] = useState(0);

    // Helper to combine date+time to string
    const getISO = (dateStr: string, timeStr: string) => {
        if (!dateStr || !timeStr) return null;
        return `${dateStr}T${timeStr}:00`;
    };

    const formatMinutes = (totalMinutes: number) => {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    // Derived Duration for Display
    const getDurationDisplay = () => {
        const startISO = getISO(startDate, startClock);
        const endISO = getISO(endDate, endClock);
        if (!startISO || !endISO) return '0 min';

        const start = new Date(startISO);
        const end = new Date(endISO);
        const diffMs = end.getTime() - start.getTime();
        const minutes = Math.round(diffMs / 60000);
        if (minutes < 0) return 'Invalid dates';

        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}m (${minutes} min)` : `${minutes} min`;
    };

    const parseDateToParts = (isoString: string) => {
        const date = new Date(isoString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        const iso = date.toISOString();
        return {
            date: iso.slice(0, 10),
            time: iso.slice(11, 16)
        };
    };

    useEffect(() => {
        if (isOpen) {
            setStopMode(false);
            setFinalPrice(null);
            if (existingBooking) {
                setCustomerName(existingBooking.customer_name);
                setCustomerPhone(existingBooking.customer_phone);

                const startParts = parseDateToParts(existingBooking.start_time);
                setStartDate(startParts.date);
                setStartClock(startParts.time);

                const endParts = parseDateToParts(existingBooking.end_time);
                setEndDate(endParts.date);
                setEndClock(endParts.time);

                setPaymentStatus(existingBooking.payment_status || 'unpaid');
                setPaymentMethod(existingBooking.payment_method || null);
                setNotes(existingBooking.notes || '');

                setIsOpenSession(existingBooking.notes?.includes('OPEN_SESSION') || false);
            } else {
                setCustomerName('');
                setCustomerPhone('');
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

                // Current time rounded to ISO parts
                const iso = now.toISOString();
                setStartDate(iso.slice(0, 10));
                setStartClock(iso.slice(11, 16));

                // Default 1 hour later
                const end = new Date(now.getTime() + 60 * 60000);
                const endIso = end.toISOString();
                setEndDate(endIso.slice(0, 10));
                setEndClock(endIso.slice(11, 16));

                setPaymentStatus('unpaid');
                setPaymentMethod(null);
                setNotes('');
                setIsOpenSession(false);
            }
        }
    }, [isOpen, existingBooking]);

    // Force 3h if Mimdinare is checked for new booking
    useEffect(() => {
        if (isOpenSession && !existingBooking && startDate && startClock) {
            const startISO = getISO(startDate, startClock);
            if (startISO) {
                const start = new Date(startISO);
                const end = new Date(start.getTime() + 180 * 60000); // 3 hours
                const endIso = end.toISOString();
                setEndDate(endIso.slice(0, 10));
                setEndClock(endIso.slice(11, 16));
            }
        }
    }, [isOpenSession, existingBooking, startDate, startClock]);

    // Calculate Prices when entering Stop Mode
    useEffect(() => {
        if (stopMode && existingBooking) {
            const start = new Date(existingBooking.start_time);
            const end = new Date(existingBooking.end_time);
            const now = new Date();

            const eMin = Math.max(1, Math.round((now.getTime() - start.getTime()) / 60000));
            const rMin = Math.round((end.getTime() - start.getTime()) / 60000);

            setElapsedMinutes(eMin);
            setReservedMinutes(rMin);

            const type = (existingBooking.stations?.type as StationType) || 'STANDARD';

            // Calculate Logic
            const actualP = calculatePrice(type, eMin / 60);
            const reservedP = calculatePrice(type, rMin / 60);

            setCalculatedActualPrice(Number(actualP.toFixed(2)));
            setCalculatedReservedPrice(Number(reservedP.toFixed(2)));

            // Default select actual if less, otherwise reserved? Or just null to force choice.
            // Let's default to actual price as that's usually the intent of stopping early.
            setFinalPrice(Number(actualP.toFixed(2)));
        }
    }, [stopMode, existingBooking]);


    const handleStopSession = async () => {
        if (!existingBooking) return;
        setLoading(true);
        const now = new Date();

        try {
            const { error } = await supabase
                .from('bookings')
                // @ts-ignore
                .update({
                    end_time: now.toISOString(),
                    total_price: finalPrice, // Save the selected final price
                    payment_status: 'paid', // Assume immediate payment upon stop? Or keep as is? User said "Stop & Pay" so 'paid' is safer default.
                    notes: (notes || '') + ` [Stopped: Used ${elapsedMinutes}m. Charged: ${finalPrice}₾]`
                })
                .eq('id', existingBooking.id);

            if (error) throw error;
            onSuccess();
            onClose();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const startISO = getISO(startDate, startClock);
        const endISO = getISO(endDate, endClock);

        if (targetStationIds.length === 0 || !startISO || !endISO) return;
        setLoading(true);

        const start = new Date(startISO);
        const end = new Date(endISO);

        let finalNotes = notes.replace(/OPEN_SESSION/g, '').trim();
        if (isOpenSession) {
            finalNotes = (finalNotes ? finalNotes + " " : "") + "OPEN_SESSION";
        }

        try {
            if (existingBooking) {
                const bookingData = {
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    start_time: start.toISOString(),
                    end_time: end.toISOString(),
                    payment_status: paymentStatus,
                    payment_method: paymentMethod || null,
                    notes: finalNotes,
                };

                const { error } = await supabase
                    .from('bookings')
                    // @ts-ignore
                    .update(bookingData)
                    .eq('id', existingBooking.id);

                if (error) throw error;
            } else {
                // Conflict Check
                const { data: conflicts, error: checkError } = await supabase
                    .from('bookings')
                    .select('id, station_id')
                    .in('station_id', targetStationIds)
                    .neq('status', 'CANCELLED')
                    .or(`and(start_time.lte.${end.toISOString()},end_time.gte.${start.toISOString()})`);

                if (checkError) throw checkError;

                if (conflicts && conflicts.length > 0) {
                    const conflictedStations = (conflicts as any[]).map(c => c.station_id);
                    throw new Error(`Conflict detected! Stations ${conflictedStations.join(', ')} are already booked.`);
                }

                const newBookings = targetStationIds.map(sid => ({
                    station_id: sid,
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    start_time: start.toISOString(),
                    end_time: end.toISOString(),
                    payment_status: paymentStatus,
                    payment_method: paymentMethod || null,
                    notes: finalNotes,
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

    const isLive = existingBooking && new Date(existingBooking.start_time) < new Date() && new Date(existingBooking.end_time) > new Date();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <datalist id="time-slots">
                {TIME_SLOTS.map(time => (
                    <option key={time} value={time} />
                ))}
            </datalist>

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

                <div className="p-6 space-y-4 overflow-y-auto">
                    {/* STOP MODE UI */}
                    {stopMode && existingBooking ? (
                        <div className="space-y-4">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                Finalizing Session
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Played Time Option */}
                                <div
                                    onClick={() => setFinalPrice(calculatedActualPrice)}
                                    className={`p-4 rounded border cursor-pointer transition-all ${finalPrice === calculatedActualPrice ? 'bg-green-500/20 border-green-500 ring-1 ring-green-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    <span className="block text-gray-400 text-xs mb-1">Played Time ({formatMinutes(elapsedMinutes)})</span>
                                    <span className="text-2xl font-bold text-white mb-1 block">{calculatedActualPrice} ₾</span>
                                    <span className="text-[10px] text-gray-500 block">Based on time played</span>
                                    {finalPrice === calculatedActualPrice && <span className="text-green-400 text-xs font-bold mt-2 block">✓ Selected</span>}
                                </div>

                                {/* Booked Time Option */}
                                <div
                                    onClick={() => setFinalPrice(calculatedReservedPrice)}
                                    className={`p-4 rounded border cursor-pointer transition-all ${finalPrice === calculatedReservedPrice ? 'bg-green-500/20 border-green-500 ring-1 ring-green-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    <span className="block text-gray-400 text-xs mb-1">Booked Time ({formatMinutes(reservedMinutes)})</span>
                                    <span className="text-2xl font-bold text-white mb-1 block">{calculatedReservedPrice} ₾</span>
                                    <span className="text-[10px] text-gray-500 block">Full booking duration</span>
                                    {finalPrice === calculatedReservedPrice && <span className="text-green-400 text-xs font-bold mt-2 block">✓ Selected</span>}
                                </div>

                                {/* Custom Price Option */}
                                <div
                                    onClick={() => {
                                        // If already selecting custom (checking if price doesn't match standard options), keep it
                                        // Else reset to 0 or empty for typing
                                        if (finalPrice !== calculatedActualPrice && finalPrice !== calculatedReservedPrice) return;
                                        setFinalPrice(0);
                                    }}
                                    className={`col-span-2 p-4 rounded border cursor-pointer transition-all ${finalPrice !== calculatedActualPrice && finalPrice !== calculatedReservedPrice
                                        ? 'bg-blue-500/20 border-blue-500 ring-1 ring-blue-500'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <span className="block text-gray-400 text-xs mb-1">Custom Price</span>

                                    {finalPrice !== calculatedActualPrice && finalPrice !== calculatedReservedPrice ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <input
                                                type="number"
                                                autoFocus
                                                min="0"
                                                step="1"
                                                className="bg-transparent text-2xl font-bold text-white w-24 outline-none border-b border-blue-500/50 focus:border-blue-500 transition-colors"
                                                value={finalPrice || ''}
                                                onChange={(e) => setFinalPrice(parseFloat(e.target.value) || 0)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <span className="text-xl text-gray-400">₾</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl text-gray-500 font-bold block">Enter Amount...</span>
                                            <span className="text-[10px] text-gray-500">Coffee, snacks, etc.</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded text-center">
                                <p className="text-blue-200 text-sm">
                                    Charging: <span className="font-bold text-white text-lg ml-1">{finalPrice || 0} ₾</span>
                                </p>
                                <p className="text-blue-400/60 text-xs mt-1">Please collect payment before confirming.</p>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setStopMode(false)}
                                    className="flex-1 py-3 bg-white/5 text-gray-400 rounded hover:bg-white/10 transition-all text-xs"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={handleStopSession}
                                    className="flex-[2] py-3 bg-green-500 text-black font-bold rounded hover:bg-green-400 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                                >
                                    CONFIRM STOP & PAY
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Mimdinare / Open Session Toggle */}
                            {!existingBooking ? (
                                <label className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isOpenSession}
                                        onChange={(e) => setIsOpenSession(e.target.checked)}
                                        className="w-5 h-5 accent-blue-500"
                                    />
                                    <div>
                                        <span className="text-white font-bold text-sm block">Mimdinare (Open Session)</span>
                                        <span className="text-xs text-gray-400">Books for 3 hours. Stop anytime.</span>
                                    </div>
                                </label>
                            ) : isOpenSession && (
                                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg mb-4 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                                        <div>
                                            <span className="text-purple-400 font-bold text-sm block">Mimdinare Session Active</span>
                                            <span className="text-[10px] text-gray-500">Open-Ended</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsOpenSession(false)}
                                        className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] rounded border border-purple-500/30 transition-all"
                                    >
                                        Set End Time
                                    </button>
                                </div>
                            )}

                            {/* STOP BUTTON */}
                            {isLive && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex justify-between items-center">
                                    <div>
                                        <h3 className="text-red-400 font-bold text-sm">Customer Leaving?</h3>
                                        <p className="text-gray-500 text-[10px]">Stop session and free up station.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setStopMode(true)}
                                        className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded shadow-lg shadow-red-500/20 hover:bg-red-400 transition-all"
                                    >
                                        STOP SESSION
                                    </button>
                                </div>
                            )}

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

                            <div className="space-y-4">
                                {/* Start Date & Time */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Start</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            required
                                            className="flex-1 bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-xs [color-scheme:dark]"
                                            value={startDate}
                                            onChange={e => setStartDate(e.target.value)}
                                        />
                                        <input
                                            type="time"
                                            required
                                            list="time-slots"
                                            className="w-32 bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-xs [color-scheme:dark]"
                                            value={startClock}
                                            onChange={e => setStartClock(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* End Date & Time - Hidden for Open Session */}
                                {!isOpenSession && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">End</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                required={!isOpenSession}
                                                className="flex-1 bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-xs [color-scheme:dark]"
                                                value={endDate}
                                                onChange={e => setEndDate(e.target.value)}
                                            />
                                            <input
                                                type="time"
                                                required={!isOpenSession}
                                                list="time-slots"
                                                className="w-32 bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none text-xs [color-scheme:dark]"
                                                value={endClock}
                                                onChange={e => setEndClock(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Duration Display */}
                                <div className="text-right">
                                    <span className="text-xs text-gray-400 uppercase mr-2">
                                        {isOpenSession ? 'Session Type:' : 'Calculated Duration:'}
                                    </span>
                                    <span className={`text-sm font-bold ${isOpenSession ? 'text-green-400' : 'text-blue-400'}`}>
                                        {isOpenSession ? 'Open-Ended ♾️' : getDurationDisplay()}
                                    </span>
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
                    )}
                </div>
            </div>
        </div>
    );
}
