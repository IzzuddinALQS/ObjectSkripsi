'use client';

import { useState, useTransition } from 'react';
import { MapPin, User, CheckCircle, XCircle, Eye, X, ExternalLink } from 'lucide-react';
import { updateBookingStatus } from '@/features/bookings/actions';
import { useAlert } from '@/components/providers/AlertProvider';
import { translateError } from '@/lib/error';

interface Booking {
    id: number;
    status: string | null;
    startTime: Date;
    endTime: Date;
    purpose: string;
    organisasi?: string | null;
    jumlahPeserta?: number | null;
    dosenPembimbing?: string | null;
    suratPermohonan?: string | null;
    user: { fullName: string; identifier: string; phoneNumber?: string | null; };
    room: { name: string; };
}

interface ActiveBookingsTableProps {
    bookings: Booking[];
    sessionUserId: string;
}

export default function ActiveBookingsTable({ bookings, sessionUserId }: ActiveBookingsTableProps) {
    const { showConfirm, showAlert } = useAlert();
    const [isPending, startTransition] = useTransition();
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const handleApprove = (bookingId: number) => {
        startTransition(async () => {
            await updateBookingStatus(bookingId, 'Disetujui', sessionUserId);
        });
    };

    const handleReject = async (bookingId: number) => {
        const confirmed = await showConfirm({
            title: 'Tolak Booking',
            message: 'Tolak permintaan booking ini?',
            type: 'danger',
            confirmText: 'Tolak'
        });
        if (!confirmed) return;
        startTransition(async () => {
            try {
                await updateBookingStatus(bookingId, 'Ditolak', sessionUserId);
                showAlert({ title: 'Berhasil', message: 'Permintaan booking ditolak', type: 'success' });
            } catch (error: any) {
                const { title, message } = translateError(error, 'Gagal menolak booking');
                showAlert({ title, message, type: 'error' });
            }
        });
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Pemohon</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Ruangan</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Tanggal & Waktu</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Keperluan</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bookings.map((booking) => (
                            <tr key={booking.id} className={`hover:bg-gray-50 transition-colors ${isPending ? 'opacity-50' : ''}`}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-900">{booking.user.fullName}</p>
                                            <p className="text-xs text-gray-500">{booking.user.identifier}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-[#0F4C81]" />
                                        <span className="font-medium text-gray-900">{booking.room.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 text-sm">
                                    <div>{new Date(booking.startTime).toLocaleDateString('id-ID')}</div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(booking.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} -
                                        {new Date(booking.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">
                                    {booking.purpose}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${booking.status === 'Pending' ? 'bg-yellow-50 text-yellow-700' :
                                        booking.status === 'Disetujui' ? 'bg-green-50 text-green-700' :
                                            'bg-red-50 text-red-700'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-1">
                                        {/* View Details Button */}
                                        <button
                                            onClick={() => setSelectedBooking(booking)}
                                            className="text-[#0F4C81] hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Lihat Detail"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        {booking.status === 'Pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(booking.id)}
                                                    disabled={isPending}
                                                    className="text-green-600 hover:text-green-700 p-1.5 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Setujui"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(booking.id)}
                                                    disabled={isPending}
                                                    className="text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Tolak"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {bookings.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Belum ada permintaan booking.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Detail Booking */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-[#0F4C81]" />
                                Detail Booking Ruangan
                            </h3>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Data Pemohon */}
                            <div>
                                <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">Data Pemesan</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Nama Lengkap</p>
                                        <p className="font-medium text-gray-900">{selectedBooking.user.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">NIM / Identifier</p>
                                        <p className="font-medium text-gray-900">{selectedBooking.user.identifier}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Nomor HP</p>
                                        <p className="font-medium text-gray-900">{selectedBooking.user.phoneNumber || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Dosen Pembimbing</p>
                                        <p className="font-medium text-gray-900">{selectedBooking.dosenPembimbing || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Booking */}
                            <div>
                                <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">Detail Booking</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Ruangan</p>
                                        <p className="font-medium text-gray-900">{selectedBooking.room.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Tanggal</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(selectedBooking.startTime).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Waktu</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(selectedBooking.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            {' s.d '}
                                            {new Date(selectedBooking.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Jumlah Peserta</p>
                                        <p className="font-medium text-gray-900">{selectedBooking.jumlahPeserta || '-'} Orang</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Organisasi / Unit</p>
                                        <p className="font-medium text-gray-900">{selectedBooking.organisasi || '-'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500">Keperluan</p>
                                        <p className="font-medium text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">{selectedBooking.purpose}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Dokumen */}
                            {selectedBooking.suratPermohonan && (
                                <div>
                                    <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">Dokumen Tambahan</h4>
                                    <div className="text-sm border border-gray-100 p-4 rounded-xl bg-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ExternalLink className="w-5 h-5 text-gray-400" />
                                            <span className="font-medium text-gray-900">Surat Permohonan / Izin</span>
                                        </div>
                                        <a href={selectedBooking.suratPermohonan} target="_blank" rel="noopener noreferrer" className="text-[#0F4C81] hover:underline font-medium">Buka File</a>
                                    </div>
                                </div>
                            )}

                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
