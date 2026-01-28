"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { calculatePrice, StationType } from "@/config/pricing";

interface BookingSummaryProps {
    date: Date;
    duration: number;
    seats: string[];
    seatTypes: Record<string, string>;
    branchId: string;
}

export default function BookingSummary({ date, duration, seats, seatTypes, branchId }: BookingSummaryProps) {
    const router = useRouter();
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate Total Price based on all selected seats
    const totalPrice = seats.reduce((total, seatId) => {
        const type = seatTypes[seatId];
        return total + (type ? calculatePrice(type as StationType, duration) : 0);
    }, 0);

    // Validation: Needs seats, and non-empty name/phone/email
    // Also check if time is valid (not in past, with 5 min buffer)
    const isTimeValid = date.getTime() > Date.now() - 5 * 60 * 1000;
    const isFormValid = seats.length > 0 && customerName.trim().length > 0 && customerPhone.trim().length > 0 && isTimeValid;

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
                    duration
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Booking failed");
                setIsSubmitting(false);
                return;
            }

            // Success!
            alert("Booking Confirmed! See you at the lounge.");
            // Reset or Redirect
            router.push(`/${branchId}`);

        } catch (error) {
            console.error(error);
            alert("Something went wrong.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="sticky top-24 space-y-6">
            <div className="glass-card p-4 md:p-8 border-t-4 border-neon-cyan">
                {/* Header */}
                <h2 className="font-orbitron text-2xl text-white mb-6">SUMMARY</h2>

                <div className="space-y-4 mb-8">
                    {/* Date */}
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <span className="text-white/50 font-inter">Date</span>
                        <span className={`font-orbitron ${!isTimeValid ? "text-red-500 animate-pulse" : "text-white"}`}>
                            {date.toLocaleDateString()}
                        </span>
                    </div>

                    {/* Time */}
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <span className="text-white/50 font-inter">Start Time</span>
                        <span className={`font-orbitron ${!isTimeValid ? "text-red-500 animate-pulse" : "text-white"}`}>
                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {" - "}
                            {new Date(date.getTime() + duration * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    {/* Duration */}
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <span className="text-white/50 font-inter">Duration</span>
                        <span className="text-white font-orbitron text-neon-cyan">{duration} Hours</span>
                    </div>

                    {/* Seats List */}
                    <div className="flex justify-between flex-col gap-2 border-b border-white/10 pb-2">
                        <span className="text-white/50 font-inter">Stations</span>
                        <div className="flex flex-wrap gap-2 justify-end">
                            {seats.length > 0 ? (
                                seats.map(seatId => {
                                    const shortId = seatId.split('-').pop();
                                    const configId = seatId.includes("vip") ? "VIP " + shortId : "PC " + shortId;
                                    return (
                                        <span key={seatId} className="px-2 py-1 bg-white/10 rounded text-[10px] font-orbitron text-neon-cyan border border-white/20">
                                            {configId}
                                        </span>
                                    );
                                })
                            ) : (
                                <span className="text-white/20 italic">Select seats on map</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact Inputs */}
                <div className="space-y-4 mb-6">
                    <p className="text-white/50 text-xs font-inter uppercase tracking-widest">Your Details</p>
                    <div>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full bg-black/50 border border-white/20 rounded-md p-3 text-white text-sm focus:border-neon-cyan outline-none font-inter"
                        />
                    </div>
                    <div>
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full bg-black/50 border border-white/20 rounded-md p-3 text-white text-sm focus:border-neon-cyan outline-none font-inter"
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            placeholder="Email Address (Optional)"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="w-full bg-black/50 border border-white/20 rounded-md p-3 text-white text-sm focus:border-neon-cyan outline-none font-inter"
                        />
                    </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-end mb-8 pt-4 border-t border-white/10">
                    <span className="text-white/70 font-inter text-sm">Total Estimate</span>
                    <span className="text-4xl font-orbitron text-white font-bold">
                        {totalPrice}<span className="text-lg text-neon-cyan">₾</span>
                    </span>
                </div>

                {/* Confirm Button */}
                <button
                    onClick={handleConfirm}
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full py-4 text-center font-orbitron font-bold tracking-widest text-lg transition-all duration-300 rounded-md flex justify-center items-center
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
                            seats.length === 0 ? "SELECT SEATS" : "CONFIRM BOOKING"
                    )}
                </button>

                <p className="text-center text-white/30 text-[10px] mt-4 font-inter">
                    By clicking book, you agree to our terms. Payment is collected at reception.
                </p>
            </div>
        </div>
    );
}
