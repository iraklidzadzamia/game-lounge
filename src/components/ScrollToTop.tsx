"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button when scrolled to Reviews section
            if (window.scrollY > 3500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    transition={{ duration: 0.3 }}
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-neon-cyan to-electric-purple flex items-center justify-center shadow-[0_0_30px_rgba(0,243,255,0.4)] hover:shadow-[0_0_50px_rgba(0,243,255,0.6)] hover:scale-110 transition-all duration-300 group"
                    aria-label="Scroll to top"
                >
                    {/* Arrow icon */}
                    <svg
                        className="w-6 h-6 text-black group-hover:-translate-y-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 15l7-7 7 7"
                        />
                    </svg>

                    {/* Glow ring */}
                    <div className="absolute inset-0 rounded-full animate-ping bg-neon-cyan/20 pointer-events-none" style={{ animationDuration: "2s" }} />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
