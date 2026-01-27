"use client";

import { motion } from "framer-motion";
import { useState } from "react";

// Mock Data structure
const FLOORS = [
    {
        id: 1,
        name: "FLOOR 1 (VIP)",
        stations: [
            { id: "vip-1", type: "VIP", name: "VIP 1" },
            { id: "vip-2", type: "VIP", name: "VIP 2" },
        ]
    },
    {
        id: 2,
        name: "FLOOR 2",
        groups: [
            {
                name: "Left Bank",
                stations: Array.from({ length: 5 }, (_, i) => ({
                    id: `pc-2-l-${i + 1}`,
                    name: `PC ${i + 1}`,
                    type: "PREMIUM",
                }))
            },
            {
                name: "Center Bank",
                stations: Array.from({ length: 5 }, (_, i) => ({
                    id: `pc-2-c-${i + 1}`,
                    name: `PC ${i + 6}`,
                    type: "PRO",
                }))
            },
            {
                name: "Right Bank",
                stations: Array.from({ length: 6 }, (_, i) => ({
                    id: `pc-2-r-${i + 1}`,
                    name: `PC ${i + 11}`,
                    type: "PRO",
                }))
            }
        ]
    },
    {
        id: 3,
        name: "FLOOR 3",
        groups: [
            {
                name: "Left Bank",
                stations: Array.from({ length: 5 }, (_, i) => ({
                    id: `pc-3-l-${i + 1}`,
                    name: `PC ${i + 1}`,
                    type: "PREMIUM",
                }))
            },
            {
                name: "Center Bank",
                stations: Array.from({ length: 5 }, (_, i) => ({
                    id: `pc-3-c-${i + 1}`,
                    name: `PC ${i + 6}`,
                    type: "PRO",
                }))
            },
            {
                name: "Right Bank",
                stations: Array.from({ length: 6 }, (_, i) => ({
                    id: `pc-3-r-${i + 1}`,
                    name: `PC ${i + 11}`,
                    type: "PRO",
                }))
            }
        ]
    }
];

interface FloorMapProps {
    selectedSeats: string[];
    onToggle: (id: string, type: string) => void;
    unavailableIds?: string[];
}

export default function FloorMap({ selectedSeats, onToggle, unavailableIds = [] }: FloorMapProps) {
    const [activeFloor, setActiveFloor] = useState(2);

    const currentFloor = FLOORS.find(f => f.id === activeFloor);

    // Render logic for PC Floors (2 & 3)
    const renderPcFloor = (groups: any[]) => (
        <div className="relative w-full h-[500px] md:h-[600px] bg-black/20 p-4 rounded-xl overflow-hidden">

            {/* Compass / Street View Indicator (For PC Floors - Top Side) */}
            <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
                <div className="flex flex-col items-center">
                    <span className="text-xs text-neon-cyan/50 font-orbitron tracking-widest mb-1">
                        STREET VIEW
                    </span>
                    <div className="w-32 h-1 bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent rounded-full" />
                </div>
            </div>

            {/* Layout Grid using Absolute or strict flex positioning to match user request */}
            {/* Zone C (Right Bank) - Top (Centered on Mobile, Right on Desktop) */}
            <div className="absolute top-16 w-full flex flex-col items-center md:w-auto md:right-8 md:items-end z-20">
                <div className="flex flex-col items-center">
                    <h4 className="text-white/30 text-[10px] mb-2 uppercase tracking-widest font-orbitron">Zone C (Pro)</h4>
                    {/* Single Row of 6 */}
                    <div className="flex gap-1 md:gap-2">
                        {groups[2].stations.map((s: any) => renderStation(s))}
                    </div>
                </div>
            </div>

            {/* Zone A (Left) & Zone B (Center) - Clustered Bottom (Centered on Mobile, Left on Desktop) */}
            <div className="absolute bottom-8 md:bottom-12 w-full flex justify-center gap-4 md:w-auto md:left-8 md:justify-start md:gap-16 items-end z-20">
                {/* Zone A - Left Vertical */}
                <div className="flex flex-col items-center">
                    <h4 className="text-white/30 text-[10px] mb-2 uppercase tracking-widest font-orbitron">Zone A (Prem)</h4>
                    <div className="grid grid-cols-1 gap-3">
                        {groups[0].stations.map((s: any) => renderStation(s))}
                    </div>
                </div>

                {/* Zone B - Center Vertical (Close to A) */}
                <div className="flex flex-col items-center">
                    <h4 className="text-white/30 text-[10px] mb-2 uppercase tracking-widest font-orbitron">Zone B (Pro)</h4>
                    <div className="grid grid-cols-1 gap-3">
                        {groups[1].stations.map((s: any) => renderStation(s))}
                    </div>
                </div>
            </div>

            {/* Decorative Grid Lines */}
            <div className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />
        </div>
    );

    // Render logic for VIP Floor (1)
    const renderVipFloor = (stations: any[]) => (
        <div className="flex flex-col items-center gap-8 w-full max-w-xl mx-auto p-8 relative">
            {/* Window Indicator */}
            <div className="w-full flex flex-col items-center mb-4">
                <span className="text-xs text-neon-cyan/50 font-orbitron tracking-widest mb-2">
                    STREET VIEW
                </span>
                <div className="w-64 h-1 bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent rounded-full box-shadow-[0_0_10px_#00f3ff]" />
            </div>

            {stations.map((s: any) => renderStation(s, true))}
        </div>
    );

    const renderStation = (station: any, isBig = false) => {
        const isSelected = selectedSeats.includes(station.id);
        const isUnavailable = unavailableIds.includes(station.id);

        const isPremium = station.type === "PREMIUM";
        const isVip = station.type === "VIP";

        // Base styles
        let borderColor = isPremium ? "border-neon-cyan" : "border-white/20";
        let bgColor = "bg-black/80 backdrop-blur-sm";
        let textColor = isPremium ? "text-neon-cyan" : "text-white/70";
        let shadow = "none";

        // Override for Selection (Only if available)
        if (isSelected && !isUnavailable) {
            bgColor = isPremium ? "bg-neon-cyan" : "bg-white";
            textColor = "text-black";
            shadow = `0 0 15px ${isVip ? '#bc13fe' : isPremium ? '#00f3ff' : '#ffffff'}`;
            if (isVip) {
                bgColor = "bg-electric-purple";
                borderColor = "border-electric-purple";
            }
        }

        // Override for Unavailable (Highest Priority)
        if (isUnavailable) {
            borderColor = "border-red-500/30";
            bgColor = "bg-red-900/10";
            textColor = "text-red-500/30";
            shadow = "none";
        }

        return (
            <motion.button
                key={station.id}
                whileHover={!isUnavailable ? { scale: 1.05 } : {}}
                whileTap={!isUnavailable ? { scale: 0.95 } : {}}
                onClick={() => !isUnavailable && onToggle(station.id, station.type)}
                disabled={isUnavailable}
                className={`
                    group relative rounded-md border transition-all duration-300 flex flex-col items-center justify-center
                    ${borderColor} ${bgColor}
                    ${isBig ? 'h-40 w-full md:w-80' : 'h-11 w-11 md:h-20 md:w-20'}
                    ${isUnavailable ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
                style={{ boxShadow: shadow }}
            >
                <div className={`font-orbitron font-bold ${isBig ? 'text-2xl' : 'text-[10px] md:text-xl'} ${textColor}`}>
                    {station.name}
                </div>
                {!isBig && (
                    <div className={`text-[9px] md:text-[10px] uppercase tracking-wider opacity-60 font-inter ${textColor}`}>
                        {station.type.substring(0, 4)}
                    </div>
                )}

                {/* Status Indicator */}
                <div className={`absolute top-1 right-1 w-1 h-1 rounded-full shadow-[0_0_5px] 
                    ${isUnavailable
                        ? "bg-red-500 shadow-red-500"
                        : "bg-green-500 shadow-[#22c55e]"
                    }`}
                />
            </motion.button>
        );
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Floor Switcher */}
            <div className="flex gap-4 mb-4 border-b border-white/10 pb-4 justify-center">
                {FLOORS.map((floor) => (
                    <button
                        key={floor.id}
                        onClick={() => setActiveFloor(floor.id)}
                        className={`px-6 py-2 font-orbitron text-sm tracking-wider transition-all duration-300 rounded ${activeFloor === floor.id
                            ? "bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-white/20"
                            : "text-white/40 hover:text-white"
                            }`}
                    >
                        {floor.name}
                    </button>
                ))}
            </div>

            {/* Map Canvas */}
            {currentFloor?.id === 1
                ? renderVipFloor(currentFloor.stations!)
                // @ts-ignore
                : renderPcFloor(currentFloor?.groups!)
            }
        </div>
    );
}
