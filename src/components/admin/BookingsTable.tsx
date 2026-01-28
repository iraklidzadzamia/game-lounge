'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';
import { Database } from '@/types/database.types';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
    stations: { name: string; branch_id: string; type: string } | null;
};

interface BookingsTableProps {
    bookings: Booking[];
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

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this booking?')) return;
        setProcessingId(id);
        const { error } = await supabase.from('bookings').delete().eq('id', id);
        if (error) alert('Error deleting: ' + error.message);
        else onRefresh();
        setProcessingId(null);
    };

    const togglePaymentStatus = async (booking: Booking) => {
        setProcessingId(booking.id);
        const newStatus = booking.payment_status === 'paid' ? 'unpaid' : 'paid';
        const { error } = await supabase
            .from('bookings')
            .update({ payment_status: newStatus })
            .eq('id', booking.id);

        if (error) alert('Error updating payment: ' + error.message);
        else onRefresh();
        setProcessingId(null);
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading bookings...</div>;
    }

    if (bookings.length === 0) {
        return <div className="p-8 text-center text-gray-500">No bookings found.</div>;
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
                        <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-medium text-white">
                                {formatDate(booking.start_time)}
                                <div className="text-xs text-gray-500">
                                    {Math.round((new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / 60000)} min
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${booking.stations?.branch_id === 'dinamo' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                                    }`}>
                                    {booking.stations?.name || booking.station_id}
                                </span>
                                <div className="text-xs text-gray-500 mt-1">{booking.stations?.branch_id}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-white">{booking.customer_name}</div>
                                <div className="text-xs text-gray-500">{booking.customer_phone}</div>
                            </td>
                            <td className="px-6 py-4">
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
                                {booking.payment_method && (
                                    <div className="mt-1 text-xs text-gray-500 uppercase tracking-wide">
                                        {booking.payment_method.replace('card_', '')}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                                <button
                                    onClick={() => handleDelete(booking.id)}
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
