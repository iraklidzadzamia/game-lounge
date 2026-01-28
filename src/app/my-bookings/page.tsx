"use client";

import { useState } from "react";
import Link from "next/link";

export default function MyBookingsPage() {
    const [phone, setPhone] = useState("");
    const [bookings, setBookings] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setBookings(null);

        try {
            const res = await fetch(`/api/bookings/lookup?phone=${encodeURIComponent(phone)}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to find bookings");
            } else {
                setBookings(data.bookings || []);
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col items-center pt-32 px-4 bg-grid-pattern">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-cyan/10 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <h1 className="text-4xl font-orbitron font-bold text-center mb-2 bg-gradient-to-r from-white to-neon-cyan bg-clip-text text-transparent">
                    MY BOOKINGS
                </h1>
                <p className="text-center text-white/50 font-inter mb-12">
                    Enter your phone number to find active reservations
                </p>

                <form onSubmit={handleSearch} className="space-y-4 mb-12">
                    <div className="relative">
                        <input
                            type="tel"
                            placeholder="Enter Phone Number..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-white/5 border border-white/20 rounded-xl px-6 py-4 text-lg font-orbitron text-white placeholder-white/30 focus:border-neon-cyan focus:bg-white/10 outline-none transition-all text-center"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || phone.length < 4}
                        className={`w-full py-4 rounded-xl font-bold font-orbitron tracking-widest text-lg transition-all
                            ${loading || phone.length < 4
                                ? "bg-white/5 text-white/20 cursor-not-allowed"
                                : "bg-neon-cyan text-black hover:bg-white hover:shadow-[0_0_30px_rgba(0,243,255,0.4)]"
                            }`}
                    >
                        {loading ? "SEARCHING..." : "FIND BOOKINGS"}
                    </button>
                    {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                </form>

                {/* Results */}
                {bookings && (
                    <div className="space-y-4 animate-fadeIn">
                        {bookings.length === 0 ? (
                            <div className="text-center p-8 border border-white/10 rounded-xl bg-black/50 backdrop-blur">
                                <p className="text-white/50">No active bookings found for this number.</p>
                            </div>
                        ) : (
                            bookings.map((booking) => (
                                <div key={booking.id} className="p-6 border border-white/10 rounded-xl bg-black/60 backdrop-blur hover:border-white/30 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-xs text-neon-cyan border border-neon-cyan/30 px-2 py-1 rounded mb-2 inline-block">
                                                {booking.stations?.type || "STATION"}
                                            </span>
                                            <h3 className="font-orbitron text-xl">
                                                {booking.stations?.name || "Station"}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold font-orbitron">
                                                {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="text-xs text-white/50 uppercase">Start Time</div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end border-t border-white/10 pt-4">
                                        <div className="text-sm text-white/70">
                                            {new Date(booking.start_time).toLocaleDateString()}
                                            <span className="block text-xs opacity-50 capitalize">{booking.branch_id} Branch</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-orbitron text-white">
                                                {booking.total_price} ₾
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${booking.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' : 'bg-white/10'}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                <div className="mt-12 text-center">
                    <Link href="/" className="text-white/30 hover:text-white transition-colors text-sm border-b border-transparent hover:border-white pb-1">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
