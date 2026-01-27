"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import FloorMap from "@/components/booking/FloorMap";
import BookingSummary from "@/components/booking/BookingSummary";

export default function BookingPage() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [duration, setDuration] = useState<number>(3);

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
                        <section className="glass-card p-6 md:p-8">
                            <h2 className="font-orbitron text-xl text-white mb-6 flex items-center gap-3">
                                <span className="text-neon-cyan/50">01.</span> SELECT TIME
                            </h2>
                            <div className="flex flex-wrap gap-4 items-center">
                                <input
                                    type="datetime-local"
                                    className="bg-black/50 border border-white/20 rounded-md p-3 text-white focus:border-neon-cyan outline-none w-full md:w-auto"
                                    // Default to now for demo, in prod use controlled value carefully
                                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                />

                                <div className="flex gap-2">
                                    {[1, 2, 3, 5].map((hr) => (
                                        <button
                                            key={hr}
                                            onClick={() => setDuration(hr)}
                                            className={`px-4 py-2 rounded font-orbitron transition-all duration-300 border ${duration === hr
                                                ? "bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.3)]"
                                                : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                                                }`}
                                        >
                                            {hr}H
                                        </button>
                                    ))}
                                </div>

                                {isLoadingAvailability && (
                                    <span className="text-neon-cyan/50 text-xs animate-pulse ml-auto">Checking availability...</span>
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
