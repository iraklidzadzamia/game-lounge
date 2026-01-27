"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import FloorMap from "@/components/booking/FloorMap";
import BookingSummary from "@/components/booking/BookingSummary";

export default function BookingPage() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [duration, setDuration] = useState<number>(3);
    const [isCustomTime, setIsCustomTime] = useState(false);

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
                    body: JSON.stringify({
                        // Fetch conflicts for all stations to map them out
                        stationIds: getAllStationIds(),
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

    // Helper to get all IDs (hardcoded for now to match Seed)
    const getAllStationIds = () => {
        const ids = [];
        ids.push('vip-1', 'vip-2');
        for (let i = 1; i <= 5; i++) ids.push(`pc-2-l-${i}`, `pc-3-l-${i}`); // Zone A
        for (let i = 1; i <= 5; i++) ids.push(`pc-2-c-${i}`, `pc-3-c-${i}`); // Zone B
        for (let i = 1; i <= 6; i++) ids.push(`pc-2-r-${i}`, `pc-3-r-${i}`); // Zone C
        return ids;
    };

    return (
        <main className="min-h-screen bg-void pt-24 pb-12 px-4 md:px-8 relative overflow-hidden">
            {/* Background Grid */}
            <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(0, 243, 255, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 243, 255, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <header className="flex justify-between items-center mb-12">
                    <Link href="/" className="text-neon-cyan hover:text-white transition-colors duration-300 flex items-center gap-2">
                        ← BACK TO HOME
                    </Link>
                    <h1 className="font-orbitron text-3xl md:text-4xl text-white font-bold tracking-wider">
                        <span className="text-neon-cyan">SECURE</span> YOUR STATION
                    </h1>
                </header>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Interactive Map & Selection */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Step 1: Time & Date */}
                        <section className="glass-card p-6 md:p-8 space-y-8">
                            {/* Date Selection */}
                            <div>
                                <h2 className="font-orbitron text-xl text-white mb-4 flex items-center gap-3">
                                    <span className="text-neon-cyan/50">01.</span> SELECT DATE
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const now = new Date();
                                            const newDate = new Date(selectedDate);
                                            newDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
                                            setSelectedDate(newDate);
                                        }}
                                        className={`flex-1 py-3 rounded font-orbitron text-sm tracking-wider transition-all border ${new Date().toDateString() === selectedDate.toDateString()
                                            ? "bg-neon-cyan text-black border-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                                            : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white"
                                            }`}
                                    >
                                        TODAY
                                    </button>
                                    <button
                                        onClick={() => {
                                            const tmr = new Date();
                                            tmr.setDate(tmr.getDate() + 1);
                                            const newDate = new Date(selectedDate);
                                            newDate.setFullYear(tmr.getFullYear(), tmr.getMonth(), tmr.getDate());
                                            setSelectedDate(newDate);
                                        }}
                                        className={`flex-1 py-3 rounded font-orbitron text-sm tracking-wider transition-all border ${new Date(new Date().setDate(new Date().getDate() + 1)).toDateString() === selectedDate.toDateString()
                                            ? "bg-neon-cyan text-black border-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                                            : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white"
                                            }`}
                                    >
                                        TOMORROW
                                    </button>
                                    <div className="relative flex-1">
                                        <input
                                            type="date"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                                            onChange={(e) => {
                                                if (!e.target.value) return;
                                                const [y, m, d] = e.target.value.split('-').map(Number);
                                                const newDate = new Date(selectedDate);
                                                newDate.setFullYear(y, m - 1, d);
                                                setSelectedDate(newDate);
                                            }}
                                        />
                                        <button className={`w-full py-3 rounded font-orbitron text-sm tracking-wider transition-all border ${![new Date().toDateString(), new Date(new Date().setDate(new Date().getDate() + 1)).toDateString()].includes(selectedDate.toDateString())
                                            ? "bg-neon-cyan text-black border-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                                            : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white"
                                            }`}>
                                            CUSTOM
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right mt-2 text-xs text-white/30 font-inter">
                                    Selected: {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                </div>
                            </div>

                            {/* Time Selection */}
                            <div>
                                <h3 className="text-white/50 text-xs font-inter uppercase tracking-widest mb-3">Start Time</h3>
                                {!isCustomTime ? (
                                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mask-fade-right">
                                        {Array.from({ length: 48 }).map((_, i) => {
                                            const hour = Math.floor(i / 2);
                                            const min = (i % 2) * 30;
                                            const timeString = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                                            const slotDate = new Date(selectedDate);
                                            slotDate.setHours(hour, min, 0, 0);

                                            const now = new Date();
                                            const isPast = slotDate.getTime() < now.getTime() + 15 * 60000;
                                            if (isPast) return null;

                                            const isSelected = selectedDate.getHours() === hour && selectedDate.getMinutes() === min;

                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        setSelectedDate(slotDate);
                                                        setIsCustomTime(false);
                                                    }}
                                                    className={`flex-shrink-0 px-4 py-2 rounded font-orbitron text-sm border transition-all ${isSelected
                                                        ? "bg-neon-cyan text-black border-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.3)] scale-105"
                                                        : "bg-black/40 text-white/70 border-white/10 hover:border-neon-cyan/50 hover:text-white"
                                                        }`}
                                                >
                                                    {timeString}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => setIsCustomTime(true)}
                                            className="flex-shrink-0 px-4 py-2 rounded font-orbitron text-sm border bg-white/5 border-white/20 text-neon-cyan hover:bg-white/10 hover:border-neon-cyan transition-all"
                                        >
                                            CUSTOM
                                        </button>
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
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
