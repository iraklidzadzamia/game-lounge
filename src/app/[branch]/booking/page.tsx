"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import FloorMap from "@/components/booking/FloorMap";
import BookingSummary from "@/components/booking/BookingSummary";

// Deployment trigger: Force update
const isSameDate = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

export default function BookingPage({ params }: { params: { branch: string } }) {
    // Helper to get next 30-minute slot
    const getNextSlot = () => {
        const d = new Date();
        const minutes = d.getMinutes();
        const remainder = 30 - (minutes % 30);
        d.setMinutes(minutes + remainder);
        d.setSeconds(0);
        d.setMilliseconds(0);
        return d;
    };

    const [isMounted, setIsMounted] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(getNextSlot());

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [duration, setDuration] = useState<number>(3);
    const [isCustomTime, setIsCustomTime] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    // Date Helpers
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Selection State
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [selectedSeatTypes, setSelectedSeatTypes] = useState<Record<string, string>>({});

    // Availability State
    const [unavailableIds, setUnavailableIds] = useState<string[]>([]);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

    // Fetch Availability when Date/Duration changes
    useEffect(() => {
        const fetchAvailability = async () => {
            setIsLoadingAvailability(true);
            const endTime = new Date(selectedDate.getTime() + duration * 60 * 60 * 1000);

            try {
                const res = await fetch('/api/check-availability', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    cache: 'no-store',
                    body: JSON.stringify({
                        // Fetch conflicts for all stations to map them out
                        stationIds: getAllStationIds(),
                        branchId: params.branch,
                        startTime: selectedDate.toISOString(),
                        endTime: endTime.toISOString()
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    setUnavailableIds(data.unavailable || []);
                }
            } catch (error) {
                console.error("Failed to check availability", error);
            } finally {
                setIsLoadingAvailability(false);
            }
        };

        // Debounce or just run
        fetchAvailability();
    }, [selectedDate, duration]);

    const handleSeatToggle = (id: string, type: string) => {
        if (selectedSeats.includes(id)) {
            setSelectedSeats(prev => prev.filter(s => s !== id));
            const newTypes = { ...selectedSeatTypes };
            delete newTypes[id];
            setSelectedSeatTypes(newTypes);
        } else {
            setSelectedSeats(prev => [...prev, id]);
            setSelectedSeatTypes(prev => ({ ...prev, [id]: type }));
        }
    };

    // Helper to get all IDs
    const getAllStationIds = () => {
        const ids: string[] = [];

        if (params.branch === 'dinamo') {
            // Dinamo (Old layout)
            const prefix = 'dinamo-';
            ids.push(`${prefix}vip-1`, `${prefix}vip-2`);
            for (let i = 1; i <= 5; i++) ids.push(`${prefix}pc-2-l-${i}`, `${prefix}pc-3-l-${i}`);
            for (let i = 1; i <= 5; i++) ids.push(`${prefix}pc-2-c-${i}`, `${prefix}pc-3-c-${i}`);
            for (let i = 1; i <= 6; i++) ids.push(`${prefix}pc-2-r-${i}`, `${prefix}pc-3-r-${i}`);
        } else {
            // Chikovani (New layout)
            const branch = 'chikovani';
            // VIP & PS5
            ids.push(`${branch}-vip-1`, `${branch}-vip-2`);
            for (let i = 1; i <= 6; i++) ids.push(`${branch}-ps5-${i}`);
            // Standard
            for (let i = 1; i <= 10; i++) ids.push(`${branch}-std-${i}`);
            // Pro
            for (let i = 1; i <= 7; i++) ids.push(`${branch}-pro-${i}`);
            // Premium
            for (let i = 1; i <= 5; i++) ids.push(`${branch}-prem-${i}`);
            // Premium X
            for (let i = 1; i <= 4; i++) ids.push(`${branch}-premx-${i}`);
        }
        return ids;
    };

    if (!isMounted) return <div className="min-h-screen bg-void" />;

    return (
        <main className="min-h-screen bg-void pt-24 pb-12 px-4 md:px-8 relative overflow-hidden">
            {/* Header & Back Navigation */}
            <div className="mb-8 relative z-10 flex justify-between items-center">
                <Link
                    href={`/${params.branch}`}
                    className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
                >
                    <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-orbitron tracking-widest text-sm">BACK to MENU</span>
                </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Interactive Map & Selection */}
                <div className="lg:col-span-2 space-y-8 min-w-0">

                    {/* Step 1: Time & Date */}
                    <section className="glass-card p-6 md:p-8 space-y-8">
                        {/* Date Selection */}
                        <div>
                            <h2 className="font-orbitron text-xl text-white mb-4 flex items-center gap-3">
                                <span className="text-neon-cyan/50">01.</span> SELECT DATE
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => {
                                        // Set to "Now" (rounded up) if Today is selected
                                        // If "Next Slot" is tomorrow, we still try to set "Today" but maybe clamp it?
                                        // Actually, the user wants to "View Today's Slots".
                                        // If we set it to Now, the slots list will filter out past.
                                        setSelectedDate(new Date());
                                        setIsCustomTime(false);
                                    }}
                                    className={`flex-1 py-3 rounded font-orbitron text-sm tracking-wider transition-all border ${isSameDate(selectedDate, today)
                                        ? "bg-neon-cyan text-black border-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    TODAY
                                </button>
                                <button
                                    onClick={() => {
                                        const t = new Date();
                                        t.setDate(t.getDate() + 1);
                                        t.setHours(0, 0, 0, 0);
                                        setSelectedDate(t);
                                        setIsCustomTime(false);
                                    }}
                                    className={`flex-1 py-3 rounded font-orbitron text-sm tracking-wider transition-all border ${isSameDate(selectedDate, tomorrow)
                                        ? "bg-neon-cyan text-black border-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    TOMORROW
                                </button>
                                <div className="relative flex-1">
                                    <button
                                        onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                        className={`w-full py-3 rounded font-orbitron text-sm tracking-wider transition-all border ${!isSameDate(selectedDate, today) && !isSameDate(selectedDate, tomorrow)
                                            ? "bg-neon-cyan text-black border-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                                            : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                                            }`}
                                    >
                                        {!isSameDate(selectedDate, today) && !isSameDate(selectedDate, tomorrow)
                                            ? selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()
                                            : "PICK DATE"}
                                    </button>

                                    {/* Custom Date Dropdown */}
                                    {isDatePickerOpen && (
                                        <div className="absolute top-full mt-2 right-0 w-[200px] md:w-[300px] bg-black/95 border border-white/20 rounded-xl p-2 shadow-[0_0_30px_rgba(0,0,0,0.8)] z-50 flex flex-col gap-1 max-h-[300px] overflow-y-auto backdrop-blur-xl">
                                            {/* Generate next 10 days starting after tomorrow */}
                                            {Array.from({ length: 10 }).map((_, i) => {
                                                const d = new Date(today);
                                                d.setDate(today.getDate() + 2 + i); // Start from day after tomorrow

                                                const isSelected = isSameDate(selectedDate, d);

                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => {
                                                            setSelectedDate(d);
                                                            setIsCustomTime(false);
                                                            setIsDatePickerOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-3 rounded font-orbitron text-xs tracking-wider transition-all flex justify-between items-center group ${isSelected
                                                            ? "bg-neon-cyan text-black"
                                                            : "hover:bg-white/10 text-white/70 hover:text-white"
                                                            }`}
                                                    >
                                                        <span>{d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()}</span>
                                                        <span className={`text-[10px] uppercase opacity-50 ${isSelected ? 'text-black' : 'text-neon-cyan'}`}>
                                                            {d.toLocaleDateString('en-GB', { weekday: 'short' })}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Backdrop to close */}
                                    {isDatePickerOpen && (
                                        <div
                                            className="fixed inset-0 z-40 bg-transparent"
                                            onClick={() => setIsDatePickerOpen(false)}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="text-right mt-2 text-xs text-white/30 font-inter">
                                Selected: {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </div>
                        </div>

                        {/* Time Selection */}
                        <div>
                            <h3 className="text-white/50 text-xs font-inter uppercase tracking-widest mb-3 flex justify-between">
                                <span>Start Time</span>
                                <span className="text-neon-cyan">
                                    SESSION: {selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedDate.getTime() + duration * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </h3>
                            {!isCustomTime ? (
                                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mask-fade-right w-full max-w-[85vw] md:max-w-full">
                                    <button
                                        onClick={() => setIsCustomTime(true)}
                                        className="flex-shrink-0 px-4 py-2 rounded font-orbitron text-sm border bg-white/5 border-white/20 text-neon-cyan hover:bg-white/10 hover:border-neon-cyan transition-all"
                                    >
                                        MANUAL
                                    </button>

                                    {/* NOW Button for Today */}
                                    {isSameDate(selectedDate, new Date()) && (
                                        <button
                                            onClick={() => {
                                                setSelectedDate(new Date());
                                                setIsCustomTime(false);
                                            }}
                                            className={`flex-shrink-0 px-4 py-2 rounded font-orbitron text-sm border transition-all ${Math.abs(selectedDate.getTime() - new Date().getTime()) < 60000
                                                ? "bg-neon-cyan text-black border-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.3)] scale-110 z-10"
                                                : "bg-black/40 text-white/70 border-white/10 hover:border-neon-cyan/50 hover:text-white"
                                                }`}
                                        >
                                            NOW
                                        </button>
                                    )}
                                    {Array.from({ length: 48 }).map((_, i) => {
                                        const hour = Math.floor(i / 2);
                                        const min = (i % 2) * 30;
                                        const timeString = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                                        const slotDate = new Date(selectedDate);
                                        slotDate.setHours(hour, min, 0, 0);

                                        const now = new Date();
                                        const isPast = slotDate < now;

                                        // Only hide past times if we are on TODAY
                                        if (isSameDate(selectedDate, now) && isPast) return null;

                                        const isSelected = selectedDate.getHours() === hour && selectedDate.getMinutes() === min;

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setSelectedDate(slotDate);
                                                    setIsCustomTime(false);
                                                }}
                                                className={`flex-shrink-0 px-4 py-2 rounded font-orbitron text-sm border transition-all ${isSelected
                                                    ? "bg-neon-cyan text-black border-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.3)] scale-110 z-10"
                                                    : "bg-black/40 text-white/70 border-white/10 hover:border-neon-cyan/50 hover:text-white"
                                                    }`}
                                            >
                                                {timeString}
                                            </button>
                                        );
                                    })}

                                </div>
                            ) : (
                                <div className="flex items-center gap-4 bg-black/40 p-4 rounded border border-white/10 animate-fadeIn">
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col">
                                            <label className="text-[10px] text-white/50 mb-1">HH</label>
                                            <input
                                                type="number"
                                                min="0" max="23"
                                                value={selectedDate.getHours().toString().padStart(2, '0')}
                                                onChange={(e) => {
                                                    const val = Math.min(23, Math.max(0, parseInt(e.target.value) || 0));
                                                    const newDate = new Date(selectedDate);
                                                    newDate.setHours(val);
                                                    setSelectedDate(newDate);
                                                }}
                                                className="w-16 bg-black border border-white/20 rounded p-2 text-center text-white font-orbitron focus:border-neon-cyan outline-none"
                                            />
                                        </div>
                                        <span className="text-white/50 text-2xl mt-4">:</span>
                                        <div className="flex flex-col">
                                            <label className="text-[10px] text-white/50 mb-1">MM</label>
                                            <input
                                                type="number"
                                                min="0" max="59"
                                                value={selectedDate.getMinutes().toString().padStart(2, '0')}
                                                onChange={(e) => {
                                                    const val = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
                                                    const newDate = new Date(selectedDate);
                                                    newDate.setMinutes(val);
                                                    setSelectedDate(newDate);
                                                }}
                                                className="w-16 bg-black border border-white/20 rounded p-2 text-center text-white font-orbitron focus:border-neon-cyan outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setIsCustomTime(false)}
                                            className="ml-4 px-4 py-2 bg-neon-cyan text-black rounded font-orbitron text-sm hover:shadow-[0_0_10px_rgba(0,243,255,0.4)] transition-all"
                                        >
                                            OK
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setIsCustomTime(false)}
                                        className="ml-auto text-xs text-white/50 hover:text-white underline"
                                    >
                                        Back to List
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Duration Selection */}
                        <div>
                            <h3 className="text-white/50 text-xs font-inter uppercase tracking-widest mb-3">Session Duration</h3>
                            <div className="flex flex-wrap gap-2 text-sm">
                                {[1, 2, 3, 5, 8].map((hr) => (
                                    <button
                                        key={hr}
                                        onClick={() => setDuration(hr)}
                                        className={`px-6 py-3 rounded font-orbitron transition-all duration-300 border flex-1 md:flex-none text-center ${duration === hr
                                            ? "bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.3)]"
                                            : "bg-black/40 border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                                            }`}
                                    >
                                        {hr} Hour{hr > 1 ? 's' : ''}
                                    </button>
                                ))}
                            </div>
                            {isLoadingAvailability && (
                                <div className="mt-2 text-neon-cyan/50 text-xs animate-pulse flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-neon-cyan"></span>
                                    Checking availability...
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Step 2: Seat Selection */}
                    <section className="glass-card p-6 md:p-8 min-h-[500px]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-orbitron text-xl text-white flex items-center gap-3">
                                <span className="text-neon-cyan/50">02.</span> SELECT STATIONS
                            </h2>
                            <span className="text-xs text-white/50 uppercase tracking-wider">
                                {selectedSeats.length > 0 ? `${selectedSeats.length} Selected` : "Multi-select enabled"}
                            </span>
                        </div>

                        <FloorMap
                            selectedSeats={selectedSeats}
                            onToggle={handleSeatToggle}
                            unavailableIds={unavailableIds}
                            branchId={params.branch}
                        />
                    </section>
                </div>

                {/* Right Column: Summary & Checkout */}
                <div className="lg:col-span-1">
                    <BookingSummary
                        date={selectedDate}
                        duration={duration}
                        seats={selectedSeats}
                        seatTypes={selectedSeatTypes}
                        branchId={params.branch}
                    />
                </div>
            </div>
        </main>
    );
}
