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
    branchId: string;
}

export default function FloorMap({ selectedSeats, onToggle, unavailableIds = [], branchId }: FloorMapProps) {
    const [activeFloor, setActiveFloor] = useState(2);

    const currentFloor = FLOORS.find(f => f.id === activeFloor);

    // Helper: Prefix logic
    // If branch is dinamo, IDs are prefixed 'dinamo-'.
    // Logic: 
    // - Visual ID (from FLOORS) is simple (e.g. 'vip-1').
    // - Real ID (in selectedSeats/unavailableIds) is prefixed (e.g. 'dinamo-vip-1').

    // We need to convert Visual ID -> Real ID when Toggling.
    // We need to match Real ID -> Visual ID when checking selection/unavailability.

    const getRealId = (visualId: string) => {
        return branchId === 'dinamo' ? `dinamo-${visualId}` : visualId;
    };

    // When rendering, we have 'station.id' (visual).
    // We need to check if 'getRealId(station.id)' is in the lists.

    // --- CHIKOVANI LAYOUT ---
    const renderChikovaniLayout = () => (
        <div className="w-full flex flex-col gap-8 p-4">
            {/* Row 1: PS5 1 & 2 (Moved from Premium Area) */}
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 glass-panel p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center min-h-[120px]">
                    <h3 className="text-neon-cyan font-orbitron mb-4 text-sm text-center">PLAYSTATION 5</h3>
                    <div className="flex gap-4">
                        {renderStation({ id: 'chikovani-ps5-1', name: 'PS5 1', type: 'PS5', branch_id: 'chikovani' })}
                        {renderStation({ id: 'chikovani-ps5-2', name: 'PS5 2', type: 'PS5', branch_id: 'chikovani' })}
                    </div>
                </div>
            </div>

            {/* Row 2: PCs */}
            <div className="flex flex-col xl:flex-row gap-8">

                {/* Left Bank: Premium Area (Corrected Alignment with VIPs) */}
                <div className="flex-1 glass-panel p-4 rounded-xl border border-white/10 flex flex-col items-center">
                    <h3 className="text-neon-cyan font-orbitron mb-4 text-sm text-center">PREMIUM AREA</h3>
                    <div className="flex gap-6 items-stretch h-full">
                        {/* Left Column: VIP 2 (Top/Large) -> VIP 1 (Bottom) */}
                        <div className="flex flex-col gap-4 justify-between pt-8">
                            {/* VIP 2 (Top - Large Space) */}
                            <div className="flex-1 border border-electric-purple/30 bg-electric-purple/10 p-4 rounded flex flex-col items-center justify-center relative min-h-[150px]">
                                <span className="text-xs text-electric-purple mb-2 font-orbitron font-bold">VIP 2</span>
                                {renderStation({ id: 'chikovani-vip-2', name: 'VIP 2', type: 'VIP', branch_id: 'chikovani' })}
                            </div>

                            {/* VIP 1 (Bottom) */}
                            <div className="border border-electric-purple/30 bg-electric-purple/10 p-2 rounded flex flex-col items-center relative">
                                <span className="text-[8px] text-electric-purple mb-1 font-orbitron">VIP 1</span>
                                {renderStation({ id: 'chikovani-vip-1', name: 'VIP 1', type: 'VIP', branch_id: 'chikovani' })}
                            </div>
                        </div>

                        {/* Premium (Vertical - Right) */}
                        <div className="flex flex-col items-center h-full justify-center">
                            <span className="text-[10px] text-white/30 font-orbitron text-center mb-1">PREM</span>
                            <div className="flex flex-col gap-2">
                                {Array.from({ length: 5 }).map((_, i) =>
                                    renderStation({ id: `chikovani-prem-${i + 1}`, name: `PREM ${i + 1}`, type: 'PREMIUM', branch_id: 'chikovani' })
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Room: PRO + STANDARD + PREM X (Merged) */}
                <div className="flex-[2] glass-panel p-6 rounded-xl border border-white/10 flex flex-col items-center">
                    <h3 className="text-white/70 font-orbitron mb-6 text-sm flex gap-4 w-full justify-center relative">
                        <span>PRO (7)</span>
                        <span className="text-white/20">|</span>
                        <span>STANDARD (10)</span>
                    </h3>

                    <div className="flex gap-8 md:gap-12 w-full justify-center">
                        {/* LEFT: Pro Column */}
                        <div className="flex flex-col gap-2">
                            {Array.from({ length: 7 }).map((_, i) =>
                                renderStation({ id: `chikovani-pro-${i + 1}`, name: `PRO ${i + 1}`, type: 'PRO', branch_id: 'chikovani' })
                            )}
                        </div>

                        {/* RIGHT: Standard + Passage + Premium X */}
                        <div className="flex flex-col border-l border-white/5 pl-8 md:pl-12">
                            {/* Standard Stations */}
                            <div className="flex gap-4 mb-6">
                                <div className="flex flex-col gap-2">
                                    {Array.from({ length: 5 }).map((_, i) =>
                                        renderStation({ id: `chikovani-std-${i + 1}`, name: `STD ${i + 1}`, type: 'STANDARD', branch_id: 'chikovani' })
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    {Array.from({ length: 5 }).map((_, i) =>
                                        renderStation({ id: `chikovani-std-${i + 6}`, name: `STD ${i + 6}`, type: 'STANDARD', branch_id: 'chikovani' })
                                    )}
                                </div>
                            </div>

                            {/* Divider / Passage */}
                            <div className="w-full flex items-center gap-4 mb-6 opacity-30">
                                <div className="h-px bg-white flex-1" />
                                <span className="text-[10px] font-orbitron tracking-widest uppercase">PASSAGE</span>
                                <div className="h-px bg-white flex-1" />
                            </div>

                            {/* Premium X (Aligned under Standard) */}
                            <div className="flex flex-col items-center">
                                <h3 className="text-neon-cyan font-orbitron mb-4 text-sm">PREMIUM X (4)</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {Array.from({ length: 4 }).map((_, i) =>
                                        renderStation({ id: `chikovani-premx-${i + 1}`, name: `X ${i + 1}`, type: 'PREMIUM_X', branch_id: 'chikovani' })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Row 3: Bottom Lounge (Small Square Room) */}
            <div className="w-full max-w-[450px] mx-auto glass-panel p-6 rounded-xl border border-white/10 relative aspect-square flex flex-col justify-between">
                {/* Reception - Top Center */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 w-full">
                    <div className="px-4 py-1.5 border border-neon-cyan/30 rounded bg-neon-cyan/10 text-neon-cyan text-[10px] font-orbitron tracking-widest uppercase mb-1 backdrop-blur-md whitespace-nowrap">
                        RECEPTION
                    </div>
                </div>

                <div className="flex justify-between items-center flex-1 pt-12 px-2">
                    {/* Left Side: 2 PS5s */}
                    <div className="flex flex-col gap-4">
                        {renderStation({ id: `chikovani-ps5-3`, name: `PS5 3`, type: 'PS5', branch_id: 'chikovani' })}
                        {renderStation({ id: `chikovani-ps5-4`, name: `PS5 4`, type: 'PS5', branch_id: 'chikovani' })}
                    </div>

                    {/* Center Void */}
                    <div className="text-white/5 font-orbitron text-2xl tracking-[0.5em] opacity-20 select-none rotate-90">
                        LOUNGE
                    </div>

                    {/* Right Side: 2 PS5s */}
                    <div className="flex flex-col gap-4">
                        {renderStation({ id: `chikovani-ps5-5`, name: `PS5 5`, type: 'PS5', branch_id: 'chikovani' })}
                        {renderStation({ id: `chikovani-ps5-6`, name: `PS5 6`, type: 'PS5', branch_id: 'chikovani' })}
                    </div>
                </div>
            </div>

            {/* Street View Indicator (Bottom) */}
            <div className="w-full flex flex-col items-center mt-4">
                <div className="w-64 h-1 bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent rounded-full box-shadow-[0_0_10px_#00f3ff]" />
                <span className="text-xs text-neon-cyan/50 font-orbitron tracking-widest mt-2">
                    STREET VIEW
                </span>
            </div>
        </div>
    );

    // Render logic for PC Floors (2 & 3)
    const renderPcFloor = (groups: any[]) => (
        <div className="relative w-full h-[550px] md:h-[700px] bg-black/20 p-2 md:p-4 rounded-xl overflow-hidden flex flex-row">

            {/* Street View Indicator (Left Side - Vertical) */}
            <div className="h-full flex flex-col items-center justify-center mr-1 md:mr-8 z-10 w-6 md:w-8 flex-shrink-0 border-r border-white/5">
                <div className="flex flex-col items-center h-full justify-center gap-4">
                    <div className="h-24 md:h-32 w-1 bg-gradient-to-b from-transparent via-neon-cyan/40 to-transparent rounded-full" />
                    <span className="text-[8px] md:text-[10px] text-neon-cyan/50 font-orbitron tracking-widest whitespace-nowrap -rotate-90 origin-center">
                        STREET VIEW
                    </span>
                    <div className="h-24 md:h-32 w-1 bg-gradient-to-b from-transparent via-neon-cyan/40 to-transparent rounded-full" />
                </div>
            </div>

            {/* Main Layout Area */}
            <div className="flex flex-1 gap-1 md:gap-12 z-20 h-full relative">

                {/* 1. Zone C (Pro) - Vertical Column (Left) - Top Aligned */}
                <div className="flex flex-col justify-start items-center h-full pt-4 md:pt-8 w-1/4 md:w-auto">
                    <h4 className="text-white/30 text-[8px] md:text-[10px] mb-4 uppercase tracking-widest font-orbitron -rotate-90 md:rotate-0 whitespace-nowrap">
                        Zone C (Pro)
                    </h4>
                    <div className="flex flex-col gap-2">
                        {groups[2].stations.map((s: any) => renderStation(s))}
                    </div>
                </div>

                {/* 2. Right Side Area (Zone B & A) - Horizontal Rows - Bottom Aligned */}
                <div className="flex flex-col justify-end gap-6 md:gap-8 flex-1 items-start pb-4 md:pb-8 ml-1 md:ml-12 overflow-x-visible">

                    {/* Zone B (Pro) - Horizontal Row (Middle) */}
                    <div className="flex flex-col w-full">
                        <h4 className="text-white/30 text-[8px] md:text-[10px] mb-2 uppercase tracking-widest font-orbitron ml-1">
                            Zone B (Pro)
                        </h4>
                        {/* Using flex-nowrap to prevent breaking on mobile */}
                        <div className="flex flex-wrap md:flex-wrap gap-1 md:gap-3">
                            {groups[1].stations.map((s: any) => renderStation(s))}
                        </div>
                    </div>

                    {/* Zone A (Prem) - Horizontal Row (Bottom) */}
                    <div className="flex flex-col w-full">
                        <h4 className="text-white/30 text-[8px] md:text-[10px] mb-2 uppercase tracking-widest font-orbitron ml-1">
                            Zone A (Prem)
                        </h4>
                        {/* Using flex-nowrap to prevent breaking on mobile */}
                        <div className="flex flex-wrap md:flex-wrap gap-1 md:gap-3">
                            {groups[0].stations.map((s: any) => renderStation(s))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Decorative Grid Lines */}
            <div className="absolute inset-0 pointer-events-none -z-0"
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
        const realId = getRealId(station.id);
        const isSelected = selectedSeats.includes(realId);
        const isUnavailable = unavailableIds.includes(realId);

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
                onClick={() => !isUnavailable && onToggle(realId, station.type)}
                disabled={isUnavailable}
                className={`
                    group relative rounded-md border transition-all duration-300 flex flex-col items-center justify-center
                    ${borderColor} ${bgColor}
                    ${isBig ? 'h-40 w-full md:w-80' : 'h-9 w-9 md:h-16 md:w-16'}
                    ${isUnavailable ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
                style={{ boxShadow: shadow }}
            >
                {/* Font Size Tweak: Smaller for better fill */}
                <div className={`font-orbitron font-bold ${isBig ? 'text-xl md:text-2xl' : 'text-[8px] md:text-base'} ${textColor}`}>
                    {station.name}
                </div>
                {!isBig && (
                    <div className={`text-[6px] md:text-[8px] uppercase tracking-wider opacity-60 font-inter ${textColor}`}>
                        {station.type.substring(0, 4)}
                    </div>
                )}

                {/* Status Indicator */}
                <div className={`absolute top-0.5 right-0.5 md:top-1 md:right-1 w-0.5 h-0.5 md:w-1 md:h-1 rounded-full shadow-[0_0_5px] 
                    ${isUnavailable
                        ? "bg-red-500 shadow-red-500"
                        : "bg-green-500 shadow-[#22c55e]"
                    }`}
                />
            </motion.button>
        );
    };

    if (branchId === 'chikovani') {
        return renderChikovaniLayout();
    }

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
