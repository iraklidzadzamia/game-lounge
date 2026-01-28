"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AnalyticsDashboard({ branchId }: { branchId: string }) {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [historicalRevenue, setHistoricalRevenue] = useState<number | null>(null);

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

    // Fetch Historical Stats when date changes
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // We'll reuse the same endpoint but pass a 'date' param
                // Note: Need to update API to handle 'date' or create new one. 
                // For now, let's assume the API returns 'dailyRevenue' for today, 
                // and we might need a separate call for history.
                // Let's keep it simple: The API currently returns today.
                // WE NEED TO UPDATE THE API TO SUPPORT ?date=...
                const res = await fetch(`/api/admin/stats?branchId=${branchId}&date=${selectedDate}`);
                const data = await res.json();
                setHistoricalRevenue(data.specificDateRevenue);
            } catch (err) {
                console.error(err);
            }
        };
        if (selectedDate) fetchHistory();
    }, [selectedDate, branchId]);

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

                {/* 3. Historical View */}
                <div className="glass-card p-6 border-l-4 border-yellow-500">
                    <h3 className="text-white/50 font-inter text-xs uppercase tracking-widest mb-3">Check Past Revenue</h3>
                    <div className="flex items-center gap-4">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-black/50 border border-white/20 rounded p-2 text-white font-orbitron text-sm focus:border-yellow-500 outline-none"
                        />
                        <div className="text-xl font-orbitron text-white">
                            {historicalRevenue !== null ? historicalRevenue : '-'} <span className="text-sm text-yellow-500">₾</span>
                        </div>
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
