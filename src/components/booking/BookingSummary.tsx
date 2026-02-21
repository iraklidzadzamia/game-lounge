"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { calculatePrice, StationType } from "@/config/pricing";
import { BRANCHES } from "@/config/branches";

interface BookingSummaryProps {
    date: Date;
    duration: number;
    seats: string[];
    seatTypes: Record<string, string>;
    branchId: string;
}

export default function BookingSummary({ date, duration, seats, seatTypes, branchId }: BookingSummaryProps) {
    const router = useRouter();
    // ... imports
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");

    // Extras
    const [guestCount, setGuestCount] = useState(1);
    const [controllersCount, setControllersCount] = useState(2);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Check types
    const hasPS5 = seats.some(id => seatTypes[id] === 'PS5');
    const hasVIP = seats.some(id => seatTypes[id] === 'VIP');

    // Calculate Total Price
    const totalPrice = seats.reduce((total, seatId) => {
        const type = seatTypes[seatId];
        return total + (type ? calculatePrice(type as StationType, duration, { guests: guestCount, controllers: controllersCount }) : 0);
    }, 0);

    // Validation...
    const isTimeValid = date.getTime() > Date.now() - 5 * 60 * 1000;
    const isPhoneValid = customerPhone.trim().length > 0 && /\d/.test(customerPhone) && !/[a-zA-Z]/.test(customerPhone);
    const isFormValid = seats.length > 0 && customerName.trim().length > 0 && isPhoneValid && isTimeValid;

    const handleConfirm = async () => {
        if (!isFormValid) return;
        setIsSubmitting(true);

        const endTime = new Date(date.getTime() + duration * 60 * 60 * 1000);

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stationIds: seats,
                    branchId,
                    startTime: date.toISOString(),
                    endTime: endTime.toISOString(),
                    customerName,
                    customerPhone,
                    customerEmail,
                    duration,
                    guestCount,
                    controllersCount
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Booking failed");
                setIsSubmitting(false);
                return;
            }

            // Success!
            setIsSuccess(true);
            setIsSubmitting(false);

        } catch (error) {
            console.error(error);
            alert("Something went wrong.");
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="sticky top-24 space-y-6">
                <div className="glass-card p-8 border-t-4 border-green-500 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <svg className="w-32 h-32 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>

                    <h2 className="font-orbitron text-2xl text-green-500 mb-2">BOOKING CONFIRMED</h2>
                    <p className="text-white/50 text-sm font-inter mb-8">Your spot is secured. Please arrive 10 mins early.</p>

                    <div className="space-y-4 border-l-2 border-white/10 pl-4 mb-8">
                        <div>
                            <p className="text-white/30 text-xs uppercase tracking-widest">When</p>
                            <p className="text-white font-orbitron text-lg">
                                {date.toLocaleDateString()} <span className="text-white/50">at</span> {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <div>
                            <p className="text-white/30 text-xs uppercase tracking-widest">Where</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {seats.map(seatId => (
                                    <span key={seatId} className="px-2 py-1 bg-white/10 rounded text-xs font-bold text-neon-cyan border border-white/20">
                                        {seatId.includes("vip") ? "VIP" : "PC"} {seatId.split('-').pop()}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-white/30 text-xs uppercase tracking-widest">Client</p>
                            <p className="text-white font-inter">{customerName}</p>
                            <p className="text-white/50 text-sm font-inter">{customerPhone}</p>
                        </div>
                        <div>
                            <p className="text-white/30 text-xs uppercase tracking-widest">Total to Pay</p>
                            <p className="text-2xl font-orbitron text-white">{totalPrice} ₾</p>
                        </div>
                    </div>

                    <p className="text-xs text-center text-white/30 mb-6 bg-white/5 p-2 rounded">
                        * Please take a screenshot of this ticket just in case.
                    </p>

                    <button
                        onClick={() => router.push(`/${branchId}`)}
                        className="w-full py-4 text-center font-orbitron font-bold tracking-widest text-lg bg-green-500 text-black rounded-md hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                    >
                        DONE
                    </button>

                    <button
                        onClick={() => setIsSuccess(false)} // Just in case they want to book another? Or better logic? Maybe just force Home.
                        className="w-full mt-2 py-2 text-center font-inter text-xs text-white/30 hover:text-white transition-colors"
                    >
                        Book Another Session
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="sticky top-24 space-y-6">
            <div className="glass-card p-4 md:p-8 border-t-4 border-neon-cyan">
                {/* Content Container - Vertical on Mobile, Grid on Desktop */}
                <div className="flex flex-col lg:grid lg:grid-cols-[1.2fr_1.2fr_0.8fr] gap-6 lg:gap-8 items-end">

                    {/* LEFT SECTION: Info & Branch */}
                    <div className="flex-1 space-y-4 lg:space-y-2 min-w-0 w-full">
                        {/* Branch Selector (Compact on Desktop) */}
                        <div className="bg-white/5 p-2 lg:p-0 lg:bg-transparent lg:border-none rounded-lg border border-white/10 flex lg:inline-flex justify-between items-center gap-4 mb-2 lg:mb-0">
                            <span className="text-white/50 text-xs font-inter uppercase tracking-widest lg:hidden">Branch</span>
                            <div className="flex gap-2">
                                {BRANCHES.map(b => (
                                    <button
                                        key={b.id}
                                        onClick={() => {
                                            if (b.id !== branchId) router.push(`/${b.slug}/booking`);
                                        }}
                                        className={`px-3 py-1.5 rounded text-[10px] font-orbitron font-bold transition-all border ${b.id === branchId
                                            ? "bg-neon-cyan text-black border-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.3)]"
                                            : "bg-black/50 text-white/50 border-white/10 hover:text-white hover:border-white/30"
                                            }`}
                                    >
                                        {b.name.replace('Simon ', '')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Booking Details (Grid on Desktop) */}
                        <div className="space-y-4 lg:space-y-0 lg:flex lg:gap-6 lg:items-center text-sm">
                            {/* Date */}
                            <div className="flex justify-between items-center border-b border-white/10 pb-2 lg:border-none lg:pb-0 lg:block">
                                <span className="text-white/50 font-inter lg:text-xs lg:block lg:mb-1">Date</span>
                                <span className={`font-orbitron ${!isTimeValid ? "text-red-500 animate-pulse" : "text-white"}`}>
                                    {date.toLocaleDateString()}
                                </span>
                            </div>

                            {/* Time */}
                            <div className="flex justify-between items-center border-b border-white/10 pb-2 lg:border-none lg:pb-0 lg:block">
                                <span className="text-white/50 font-inter lg:text-xs lg:block lg:mb-1">Start Time</span>
                                <span className={`font-orbitron ${!isTimeValid ? "text-red-500 animate-pulse" : "text-white"}`}>
                                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    <span className="text-white/30 mx-1">-</span>
                                    {new Date(date.getTime() + duration * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            {/* Duration */}
                            <div className="flex justify-between items-center border-b border-white/10 pb-2 lg:border-none lg:pb-0 lg:block">
                                <span className="text-white/50 font-inter lg:text-xs lg:block lg:mb-1">Duration</span>
                                <span className="text-white font-orbitron text-neon-cyan">{duration} Hours</span>
                            </div>

                            {/* Seats List */}
                            <div className="flex justify-between flex-col gap-2 border-b border-white/10 pb-2 lg:border-none lg:pb-0 lg:block">
                                <span className="text-white/50 font-inter lg:text-xs lg:block lg:mb-1">Stations</span>
                                <div className="flex flex-wrap gap-2 justify-end lg:justify-start">
                                    {seats.length > 0 ? (
                                        seats.map(seatId => {
                                            const shortId = seatId.split('-').pop();
                                            const configId = seatId.includes("vip") ? "VIP " + shortId : "PC " + shortId;
                                            return (
                                                <span key={seatId} className="px-2 py-1 bg-white/10 rounded text-[10px] font-orbitron text-neon-cyan border border-white/20 whitespace-nowrap">
                                                    {configId}
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <span className="text-white/20 italic text-xs">None</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE SECTION: Inputs & Extras */}
                    <div className="flex-1 min-w-0 flex flex-col justify-end gap-4">
                        {/* EXTRAS SELECTOR (Horizontal on Desktop) */}
                        {(hasPS5 || hasVIP) && (
                            <div className="space-y-4 border-b border-white/10 pb-4 lg:border-none lg:pb-0 lg:flex lg:gap-4 lg:space-y-0">
                                {hasPS5 && (
                                    <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/10 lg:gap-3">
                                        <div className="text-left">
                                            <p className="text-white text-xs font-medium">Controllers</p>
                                        </div>
                                        <div className="flex bg-black/50 rounded-lg p-1 border border-white/10">
                                            <button onClick={() => setControllersCount(2)} className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${controllersCount === 2 ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}>2</button>
                                            <button onClick={() => setControllersCount(4)} className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${controllersCount === 4 ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}>4</button>
                                        </div>
                                    </div>
                                )}

                                {hasVIP && (
                                    <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/10 lg:gap-3">
                                        <div className="text-left">
                                            <p className="text-white text-xs font-medium">Guests</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-black/50 rounded-lg px-2 py-1 border border-white/10">
                                            <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white">-</button>
                                            <span className="text-white font-bold w-3 text-center text-xs">{guestCount}</span>
                                            <button onClick={() => setGuestCount(guestCount + 1)} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white">+</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Contact Inputs (Horizontal Row on Desktop) */}
                        <div className="space-y-4 lg:space-y-0 lg:flex lg:gap-2 w-full">
                            <input
                                type="text"
                                placeholder="Name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full bg-black/50 border border-white/20 rounded-md p-3 lg:p-2 text-white text-sm focus:border-neon-cyan outline-none font-inter"
                            />
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="w-full bg-black/50 border border-white/20 rounded-md p-3 lg:p-2 text-white text-sm focus:border-neon-cyan outline-none font-inter"
                            />
                            <input
                                type="email"
                                placeholder="Email (Opt)"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                className="w-full bg-black/50 border border-white/20 rounded-md p-3 lg:p-2 text-white text-sm focus:border-neon-cyan outline-none font-inter"
                            />
                        </div>
                    </div>

                    {/* RIGHT SECTION: Total & Action */}
                    <div className="flex flex-col gap-4 min-w-[200px]">
                        {/* Total */}
                        <div className="flex justify-between items-end pt-4 border-t border-white/10 lg:border-none lg:pt-0">
                            <span className="text-white/70 font-inter text-sm lg:hidden">Total</span>
                            <span className="text-4xl font-orbitron text-white font-bold text-right w-full">
                                {totalPrice}<span className="text-lg text-neon-cyan">₾</span>
                            </span>
                        </div>

                        {/* Confirm Button */}
                        <button
                            onClick={handleConfirm}
                            disabled={!isFormValid || isSubmitting}
                            className={`w-full py-4 lg:py-3 text-center font-orbitron font-bold tracking-widest text-lg lg:text-base transition-all duration-300 rounded-md flex justify-center items-center
                                ${isFormValid && !isSubmitting
                                    ? "bg-neon-cyan text-black hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] cursor-pointer"
                                    : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                                }
                            `}
                        >
                            {isSubmitting ? (
                                <span className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
                            ) : (
                                !isTimeValid ? "INVALID TIME" :
                                    seats.length === 0 ? "SELECT SEATS" : "BOOK"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
