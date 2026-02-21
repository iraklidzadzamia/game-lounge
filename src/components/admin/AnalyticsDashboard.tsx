"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AnalyticsDashboard({ branchId }: { branchId: string }) {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Default range: today 00:00 to now
    const today = new Date().toISOString().split('T')[0];
    const [rangeFrom, setRangeFrom] = useState<string>(`${today}T00:00`);
    const [rangeTo, setRangeTo] = useState<string>(`${today}T23:59`);
    const [rangeRevenue, setRangeRevenue] = useState<number | null>(null);
    const [isRangeLoading, setIsRangeLoading] = useState(false);

    // Fetch Live Stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/admin/stats?branchId=${branchId}`);
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [branchId]);

    // Fetch Range Revenue when dates change
    useEffect(() => {
        const fetchRangeRevenue = async () => {
            if (!rangeFrom || !rangeTo) return;
            setIsRangeLoading(true);
            try {
                const res = await fetch(`/api/admin/stats?branchId=${branchId}&from=${rangeFrom}&to=${rangeTo}`);
                const data = await res.json();
                setRangeRevenue(data.rangeRevenue ?? null);
            } catch (err) {
                console.error(err);
            } finally {
                setIsRangeLoading(false);
            }
        };
        const timeout = setTimeout(fetchRangeRevenue, 300);
        return () => clearTimeout(timeout);
    }, [rangeFrom, rangeTo, branchId]);

    if (isLoading) return <div className="text-white/50 animate-pulse">Loading Analytics...</div>;

    return (
        <div className="space-y-8 mb-8">
            {/* Top Grid: Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Today's Revenue */}
                <div className="glass-card p-6 border-l-4 border-neon-cyan relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-16 h-16 text-neon-cyan" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v2h2v-2zm0-8H9v6h2V5z" /></svg>
                    </div>
                    <h3 className="text-white/50 font-inter text-xs uppercase tracking-widest mb-1">Revenue Today</h3>
                    <div className="text-3xl font-orbitron text-white">
                        {stats?.dailyRevenue} <span className="text-sm text-neon-cyan">₾</span>
                    </div>
                    <p className="text-white/25 text-[10px] mt-1 font-inter">✅ Completed sessions only</p>
                </div>

                {/* 2. Active Now */}
                <div className="glass-card p-6 border-l-4 border-purple-500 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-16 h-16 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                    </div>
                    <h3 className="text-white/50 font-inter text-xs uppercase tracking-widest mb-1">Active Now</h3>
                    <div className="text-3xl font-orbitron text-white">
                        {stats?.activeNow} <span className="text-sm text-purple-500">Players</span>
                    </div>
                </div>

                {/* 3. Revenue Range Calculator */}
                <div className="glass-card p-6 border-l-4 border-yellow-500">
                    <h3 className="text-white/50 font-inter text-xs uppercase tracking-widest mb-3">Calculate Revenue (Range)</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-xs w-10">From:</span>
                            <input
                                type="datetime-local"
                                value={rangeFrom}
                                onChange={(e) => setRangeFrom(e.target.value)}
                                className="bg-black/50 border border-white/20 rounded p-1.5 text-white text-xs focus:border-yellow-500 outline-none flex-1"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-xs w-10">To:</span>
                            <input
                                type="datetime-local"
                                value={rangeTo}
                                onChange={(e) => setRangeTo(e.target.value)}
                                className="bg-black/50 border border-white/20 rounded p-1.5 text-white text-xs focus:border-yellow-500 outline-none flex-1"
                            />
                        </div>
                        <div className="pt-2 border-t border-white/10 mt-2 flex justify-between items-center">
                            <span className="text-gray-400 text-xs">Total Revenue:</span>
                            <div className="text-xl font-orbitron text-white">
                                {isRangeLoading ? '...' : (rangeRevenue !== null ? rangeRevenue : '-')} <span className="text-sm text-yellow-500">₾</span>
                            </div>
                        </div>
                        {rangeRevenue !== null && (
                            <p className="text-white/25 text-[10px] font-inter">
                                ✅ Completed sessions only
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Charts (Optional / Future) */}
            {/* <div className="h-[300px] glass-card p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.revenueHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                         <XAxis dataKey="date" stroke="#888" />
                         <YAxis stroke="#888" />
                         <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333'}} />
                         <Bar dataKey="revenue" fill="#00f3ff" />
                    </BarChart>
                </ResponsiveContainer>
             </div> */}
        </div>
    );
}
