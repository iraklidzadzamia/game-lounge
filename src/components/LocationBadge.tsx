"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface LocationBadgeProps {
    address: string;
    googleMapsUrl: string;
    isOpen24_7?: boolean;
}

export default function LocationBadge({
    address,
    googleMapsUrl,
    isOpen24_7 = true
}: LocationBadgeProps) {
    const [showPopup, setShowPopup] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowPopup(false);
            }
        }
        if (showPopup) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showPopup]);

    return (
        <div className="relative" ref={containerRef}>
            <motion.button
                onClick={() => setShowPopup(!showPopup)}
                className="flex items-center gap-3 px-4 py-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:bg-black/60 hover:border-neon-cyan/40 transition-all duration-300 group z-50 relative"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
            >
                {/* Location Icon */}
                <div className="flex items-center gap-2">
                    <svg
                        className="w-4 h-4 text-neon-cyan group-hover:scale-110 transition-transform"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span className="text-white/90 text-sm font-inter font-medium hidden sm:inline">
                        {address}
                    </span>
                    <span className="text-white/90 text-sm font-inter font-medium inline sm:hidden">
                        Location
                    </span>
                </div>

                {/* Divider */}
                <div className="w-px h-4 bg-white/20" />

                {/* Hours */}
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-400 text-sm font-orbitron font-bold">
                        {isOpen24_7 ? "24/7" : "OPEN"}
                    </span>
                </div>
            </motion.button>

            {/* Compact Tooltip/Popup */}
            <AnimatePresence>
                {showPopup && (
                    <motion.div
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-max min-w-[200px]"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col gap-2 relative overflow-hidden">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                            <p className="text-white/60 text-xs text-center font-inter px-2">
                                Open in Google Maps?
                            </p>

                            <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan rounded-lg text-sm font-bold font-orbitron transition-all duration-300 border border-neon-cyan/20 hover:border-neon-cyan/50"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                OPEN MAP
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
