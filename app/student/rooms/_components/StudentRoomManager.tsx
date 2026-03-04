'use client';

import { useState } from 'react';
import { CalendarDays, ClipboardList, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import RoomBookingClient from '@/features/bookings/components/RoomBookingClient';

interface StudentRoomManagerProps {
    rooms: any[];
    myBookings: any[];
    calendarBookings: any[];
    practicumSchedules: any[];
    userId: string;
    role?: 'student' | 'lecturer';
}

export default function StudentRoomManager({
    rooms,
    myBookings,
    calendarBookings,
    practicumSchedules,
    userId,
    role = 'student'
}: StudentRoomManagerProps) {
    const [activeTab, setActiveTab] = useState<'booking' | 'history'>('booking');

    const getStatusBadge = (status: string) => {
        const styles = {
            'Pending': 'bg-yellow-50 text-yellow-700',
            'Disetujui': 'bg-green-50 text-green-700',
            'Ditolak': 'bg-red-50 text-red-700',
        };
        return styles[status as keyof typeof styles] || 'bg-gray-50 text-gray-700';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Pending': return <Clock className="w-4 h-4" />;
            case 'Disetujui': return <CheckCircle className="w-4 h-4" />;
            case 'Ditolak': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div>
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
                <button
                    onClick={() => setActiveTab('booking')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'booking'
                        ? 'bg-white text-[#0F4C81] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                >
                    <CalendarDays className="w-4 h-4" />
                    Pesan Ruangan
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'history'
                        ? 'bg-white text-[#0F4C81] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                >
                    <ClipboardList className="w-4 h-4" />
                    Riwayat Booking
                    {myBookings.filter(b => b.status === 'Pending').length > 0 && (
                        <span className="ml-1.5 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                            {myBookings.filter(b => b.status === 'Pending').length}
                        </span>
                    )}
                </button>
            </div>

            {/* Content */}
            <div>
                {activeTab === 'booking' && (
                    <RoomBookingClient
                        rooms={rooms}
                        calendarBookings={calendarBookings}
                        practicumSchedules={practicumSchedules}
                        userId={userId}
                        userRole={role === 'lecturer' ? 'Dosen' : 'Mahasiswa'}
                    />
                )}

                {activeTab === 'history' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-semibold text-gray-900">Riwayat Pengajuan Booking</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Ruangan</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Tanggal & Waktu</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Keperluan</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {myBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center shrink-0">
                                                        <MapPin className="w-4 h-4 text-[#0F4C81]" />
                                                    </div>
                                                    <span className="font-medium text-gray-900 text-sm">{booking.room.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-sm">
                                                <div className="font-medium">{new Date(booking.startTime).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {new Date(booking.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} -
                                                    {new Date(booking.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-sm max-w-xs">
                                                <p className="line-clamp-2" title={booking.purpose}>{booking.purpose}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium ${getStatusBadge(booking.status!)}`}>
                                                    {getStatusIcon(booking.status!)}
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {myBookings.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                Belum ada riwayat booking ruangan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
