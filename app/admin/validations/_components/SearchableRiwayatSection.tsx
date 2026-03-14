'use client';

import { useState, useMemo, useTransition } from 'react';
import { User, Box, Search, X, Trash2 } from 'lucide-react';
import { deleteLoan } from '@/features/loans/actions';
import { deleteBooking } from '@/features/bookings/actions';
import { useAlert } from '@/components/providers/AlertProvider';
import { translateError } from '@/lib/error';

interface CompletedLoan {
    id: number;
    requestDate: Date | null;
    student: {
        fullName: string;
        identifier: string;
    };
    item: {
        name: string;
    };
}

interface CompletedBooking {
    id: number;
    startTime: Date;
    user: {
        fullName: string;
        identifier: string;
    };
    room: {
        name: string;
    };
}

interface SearchableRiwayatProps {
    completedLoans: CompletedLoan[];
    completedBookings: CompletedBooking[];
}

export default function SearchableRiwayatSection({ completedLoans, completedBookings }: SearchableRiwayatProps) {
    const { showConfirm, showAlert } = useAlert();
    const [searchQuery, setSearchQuery] = useState('');
    const [isPending, startTransition] = useTransition();

    const filteredLoans = useMemo(() => {
        if (!searchQuery) return completedLoans;
        const query = searchQuery.toLowerCase();
        return completedLoans.filter(loan =>
            loan.student.fullName.toLowerCase().includes(query) ||
            loan.student.identifier.toLowerCase().includes(query) ||
            loan.item.name.toLowerCase().includes(query)
        );
    }, [completedLoans, searchQuery]);

    const filteredBookings = useMemo(() => {
        if (!searchQuery) return completedBookings;
        const query = searchQuery.toLowerCase();
        return completedBookings.filter(booking =>
            booking.user.fullName.toLowerCase().includes(query) ||
            booking.user.identifier.toLowerCase().includes(query) ||
            booking.room.name.toLowerCase().includes(query)
        );
    }, [completedBookings, searchQuery]);

    const handleDeleteLoan = async (loanId: number) => {
        const confirmed = await showConfirm({
            title: 'Hapus Riwayat',
            message: 'Apakah Anda yakin ingin menghapus riwayat peminjaman ini?',
            type: 'danger',
            confirmText: 'Hapus'
        });
        if (confirmed) {
            startTransition(async () => {
                try {
                    await deleteLoan(loanId);
                    showAlert({ title: 'Berhasil', message: 'Riwayat peminjaman dihapus', type: 'success' });
                } catch (error: any) {
                    const { title, message } = translateError(error, 'Gagal menghapus riwayat');
                    showAlert({ title, message, type: 'error' });
                }
            });
        }
    };

    const handleDeleteBooking = async (bookingId: number) => {
        const confirmed = await showConfirm({
            title: 'Hapus Riwayat',
            message: 'Apakah Anda yakin ingin menghapus riwayat booking ini?',
            type: 'danger',
            confirmText: 'Hapus'
        });
        if (confirmed) {
            startTransition(async () => {
                try {
                    await deleteBooking(bookingId);
                    showAlert({ title: 'Berhasil', message: 'Riwayat booking dihapus', type: 'success' });
                } catch (error: any) {
                    const { title, message } = translateError(error, 'Gagal menghapus riwayat');
                    showAlert({ title, message, type: 'error' });
                }
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama, NIM, atau alat/ruangan..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81]"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
            {searchQuery && (
                <p className="text-sm text-gray-500 -mt-6">
                    Menampilkan {filteredLoans.length} peminjaman, {filteredBookings.length} booking
                </p>
            )}

            {/* Completed Loans */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Peminjaman Selesai ({filteredLoans.length})</h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Mahasiswa</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Alat</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Tanggal</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredLoans.map((loan) => (
                                    <tr key={loan.id} className={`hover:bg-gray-50 transition-colors ${isPending ? 'opacity-50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{loan.student.fullName}</p>
                                                    <p className="text-xs text-gray-500">{loan.student.identifier}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Box className="w-4 h-4 text-gray-400" />
                                                <p className="text-gray-900">{loan.item.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {loan.requestDate ? new Date(loan.requestDate).toLocaleDateString('id-ID') : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                                                Selesai
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleDeleteLoan(loan.id)}
                                                disabled={isPending}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Hapus Riwayat"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredLoans.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            {searchQuery ? 'Tidak ada hasil pencarian' : 'Tidak ada riwayat selesai'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Completed Bookings */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Booking Selesai ({filteredBookings.length})</h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Pemohon</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Ruangan</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Waktu</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredBookings.map((booking) => (
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
                                            <p className="text-gray-900">{booking.room.name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(booking.startTime).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                                                Selesai
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleDeleteBooking(booking.id)}
                                                disabled={isPending}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Hapus Riwayat"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredBookings.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            {searchQuery ? 'Tidak ada hasil pencarian' : 'Tidak ada riwayat selesai'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
