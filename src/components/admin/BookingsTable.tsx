'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';
import { Database } from '@/types/database.types';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
    stations: { name: string; branch_id: string; type: string } | null;
};

// Accept any[] because we are passing grouped objects that exceed the Booking type
interface BookingsTableProps {
    bookings: any[];
    isLoading: boolean;
    onRefresh: () => void;
}

export default function BookingsTable({ bookings, isLoading, onRefresh }: BookingsTableProps) {
    const supabase = createClientComponentClient<Database>();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('ka-GE', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleDelete = async (booking: any) => {
        if (!confirm('Are you sure you want to delete this booking?')) return;
        setProcessingId(booking.id);

        const idsToDelete = booking.isGroup ? booking.subBookings.map((b: any) => b.id) : [booking.id];

        const { error } = await supabase
            .from('bookings')
            .delete()
            .in('id', idsToDelete);

        if (error) alert('Error deleting: ' + error.message);
        else onRefresh();
        setProcessingId(null);
    };

    const togglePaymentStatus = async (booking: any) => {
        setProcessingId(booking.id);
        const idsToUpdate = booking.isGroup ? booking.subBookings.map((b: any) => b.id) : [booking.id];
        const newStatus = booking.payment_status === 'paid' ? 'unpaid' : 'paid';

        const { error } = await supabase
            .from('bookings')
            // @ts-ignore
            .update({ payment_status: newStatus })
            .in('id', idsToUpdate);

        if (error) alert('Error updating payment: ' + error.message);
        else onRefresh();
        setProcessingId(null);
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading bookings...</div>;
    }

    if (bookings.length === 0) {
        return <div className="p-8 text-center text-gray-400">No bookings found.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-white/5 text-gray-200 uppercase font-semibold">
                    <tr>
                        <th className="px-6 py-4">Time</th>
                        <th className="px-6 py-4">Station</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Payment</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {bookings.map((booking) => (
                        <tr key={booking.isGroup ? `group-${booking.id}` : booking.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-medium text-white">
                                {formatDate(booking.start_time)}
                                <div className="text-xs text-gray-500">
                                    {(() => {
                                        const now = new Date();
                                        const start = new Date(booking.start_time);
                                        const end = new Date(booking.end_time);
                                        const isActive = now >= start && now <= end;
                                        const duration = Math.round((end.getTime() - start.getTime()) / 60000);
                                        const timeLeft = Math.round((end.getTime() - now.getTime()) / 60000);

                                        return (
                                            <div className="flex flex-col gap-1">
                                                <div className="text-xs text-gray-500">
                                                    {duration} min total
                                                </div>
                                                {isActive && (
                                                    <div className="text-xs font-bold text-green-400 animate-pulse">
                                                        {timeLeft} min left
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {booking.isGroup ? (
                                    <div className="flex flex-col gap-1">
                                        <div className="text-white font-bold text-xs bg-indigo-500/20 px-2 py-1 rounded w-fit border border-indigo-500/30">
                                            GROUP ({booking.subBookings.length})
                                        </div>
                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                            {booking.stationNames.map((name: string, idx: number) => (
                                                <span key={idx} className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${booking.stations?.branch_id === 'dinamo' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                                                    }`}>
                                                    {name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${booking.stations?.branch_id === 'dinamo' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                                            }`}>
                                            {booking.stations?.name || booking.station_id}
                                        </span>
                                        <div className="text-xs text-gray-500 mt-1">{booking.stations?.branch_id}</div>
                                    </>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-white">{booking.customer_name}</div>
                                <div className="text-xs text-gray-500">{booking.customer_phone}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col items-start gap-2">
                                    <button
                                        onClick={() => togglePaymentStatus(booking)}
                                        disabled={!!processingId}
                                        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${booking.payment_status === 'paid'
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                                            : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/20'
                                            }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${booking.payment_status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                        {booking.payment_status === 'paid' ? 'PAID' : 'UNPAID'}
                                    </button>

                                    {(booking.isGroup ? booking.totalGroupPrice : booking.total_price) && (
                                        <div className="text-sm font-bold text-white">
                                            {booking.isGroup ? booking.totalGroupPrice : booking.total_price} ₾
                                        </div>
                                    )}

                                    {booking.payment_method && (
                                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                                            {booking.payment_method.replace('card_', '')}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                                <button
                                    onClick={() => handleDelete(booking)}
                                    disabled={!!processingId}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-md transition-colors text-xs font-medium"
                                >
                                    {processingId === booking.id ? '...' : 'Delete'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
