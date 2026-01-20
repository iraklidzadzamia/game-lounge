"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BiosLoaderProps {
    onComplete: () => void;
}

export default function BiosLoader({ onComplete }: BiosLoaderProps) {
    const [progress, setProgress] = useState(0);
    const [currentLine, setCurrentLine] = useState(0);
    const [showEnter, setShowEnter] = useState(false);

    const bootLines = [
        "GAME LOUNGE BIOS v2.014",
        "Copyright (C) 2014-2026 Game Lounge Inc.",
        "",
        "Detecting Gaming Hardware...",
        "CPU: Intel Core i9-14900K @ 6.0GHz... [OK]",
        "GPU: NVIDIA GeForce RTX 4090 24GB... [OK]",
        "RAM: 64GB DDR5-6400 RGB... [OK]",
        "STORAGE: 4TB NVMe Gen5 SSD... [OK]",
        "DISPLAY: 360Hz 1ms IPS Panel... [OK]",
        "",
        "Loading Gaming Environment...",
        "Initializing RGB Subsystem... [OK]",
        "Mounting VIP Rooms... [OK]",
        "Starting PS5 Cluster... [OK]",
        "",
        "SYSTEM READY",
    ];

    useEffect(() => {
        const lineInterval = setInterval(() => {
            setCurrentLine((prev) => {
                if (prev < bootLines.length - 1) {
                    return prev + 1;
                }
                return prev;
            });
        }, 150);

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev < 100) {
                    return prev + 2;
                }
                return prev;
            });
        }, 50);

        return () => {
            clearInterval(lineInterval);
            clearInterval(progressInterval);
        };
    }, []);

    useEffect(() => {
        if (progress >= 100 && currentLine >= bootLines.length - 1) {
            setTimeout(() => setShowEnter(true), 500);
        }
    }, [progress, currentLine, bootLines.length]);

    const handleEnter = () => {
        onComplete();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-void flex flex-col items-center justify-center p-4 md:p-8"
            >
                {/* CRT Effect Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage:
                                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 243, 255, 0.03) 2px, rgba(0, 243, 255, 0.03) 4px)",
                        }}
                    />
                </div>

                <div className="w-full max-w-3xl font-mono text-sm md:text-base">
                    {/* Boot Lines */}
                    <div className="mb-8 h-[400px] overflow-hidden">
                        {bootLines.slice(0, currentLine + 1).map((line, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.1 }}
                                className={`${line.includes("[OK]")
                                        ? "text-neon-cyan"
                                        : line.includes("BIOS") || line.includes("SYSTEM READY")
                                            ? "text-electric-purple font-bold"
                                            : "text-white/70"
                                    }`}
                            >
                                {line || "\u00A0"}
                            </motion.div>
                        ))}
                        {currentLine < bootLines.length - 1 && (
                            <span className="inline-block w-2 h-4 bg-neon-cyan animate-pulse" />
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between text-xs text-white/50 mb-2">
                            <span>LOADING GAME LOUNGE...</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-neon-cyan to-electric-purple"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.1 }}
                            />
                        </div>
                    </div>

                    {/* Enter Button */}
                    <AnimatePresence>
                        {showEnter && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-center"
                            >
                                <button
                                    onClick={handleEnter}
                                    className="neon-button text-lg tracking-widest"
                                >
                                    PRESS TO ENTER
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Corner Decorations */}
                <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-neon-cyan/30" />
                <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-neon-cyan/30" />
                <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-electric-purple/30" />
                <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-electric-purple/30" />
            </motion.div>
        </AnimatePresence>
    );
}
