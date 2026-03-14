'use client';

import { useState, useMemo, useTransition } from 'react';
import { User, Box, Search, X, Trash2, MessageSquare, LayoutGrid, List } from 'lucide-react';
import { deleteLoan } from '@/features/loans/actions';
import { deleteBooking } from '@/features/bookings/actions';
import { useAlert } from '@/components/providers/AlertProvider';
import { translateError } from '@/lib/error';

interface CompletedLoan {
    id: number;
    requestDate: Date | null;
    status: string | null;
    rejectionReason: string | null;
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
    status: string | null;
    rejectionReason: string | null;
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

    // View Mode State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768 ? 'list' : 'grid';
        }
        return 'list';
    });

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
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Riwayat Peminjaman ({filteredLoans.length})</h3>
                    <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-0.5">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#0F4C81]' : 'text-gray-500 hover:text-gray-700'}`} title="Tampilan Grid">
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-[#0F4C81]' : 'text-gray-500 hover:text-gray-700'}`} title="Tampilan List">
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {viewMode === 'list' && (
                    <div className="overflow-x-auto hidden md:block">
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
                                            <span className={`text-xs px-2 py-1 rounded ${loan.status === 'Ditolak' ? 'bg-red-50 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {loan.status === 'Ditolak' ? 'Ditolak' : 'Selesai'}
                                            </span>
                                            {loan.status === 'Ditolak' && loan.rejectionReason && (
                                                <div className="mt-1.5 flex items-start gap-1.5 text-xs text-red-600 bg-red-50 rounded-lg px-2.5 py-1.5 max-w-xs">
                                                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                                    <span>{loan.rejectionReason}</span>
                                                </div>
                                            )}
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
                    )}

                    {/* Grid/Card View — always on mobile, desktop only in grid mode */}
                    <div className={`p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 ${viewMode === 'grid' ? 'grid' : 'grid md:hidden'}`}>
                            {filteredLoans.map((loan) => (
                                <div key={loan.id} className={`bg-white border rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow relative ${isPending ? 'opacity-50' : ''}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                <Box className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 break-words" title={loan.item.name}>{loan.item.name}</p>
                                                <p className="text-xs text-gray-500">{loan.requestDate ? new Date(loan.requestDate).toLocaleDateString('id-ID') : '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <User className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span className="break-words" title={loan.student.fullName}>{loan.student.fullName} ({loan.student.identifier})</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-auto pt-2">
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${loan.status === 'Ditolak' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {loan.status === 'Ditolak' ? 'Ditolak' : 'Selesai'}
                                            </span>
                                            {loan.status === 'Ditolak' && loan.rejectionReason && (
                                                <div className="flex items-start gap-1 text-xs text-red-600 mt-1 max-w-[200px]" title={loan.rejectionReason}>
                                                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                                    <span className="truncate">{loan.rejectionReason}</span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteLoan(loan.id)}
                                            disabled={isPending}
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Hapus Riwayat"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredLoans.length === 0 && (
                                <div className="col-span-full py-12 text-center text-gray-500 border rounded-xl border-dashed">
                                    {searchQuery ? 'Tidak ada hasil pencarian' : 'Tidak ada riwayat selesai'}
                                </div>
                            )}
                        </div>
                </div>
            </div>

            {/* Completed Bookings */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Riwayat Booking ({filteredBookings.length})</h3>
                    <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-0.5">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#0F4C81]' : 'text-gray-500 hover:text-gray-700'}`} title="Tampilan Grid">
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-[#0F4C81]' : 'text-gray-500 hover:text-gray-700'}`} title="Tampilan List">
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {viewMode === 'list' && (
                    <div className="overflow-x-auto hidden md:block">
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
                                            <span className={`text-xs px-2 py-1 rounded ${booking.status === 'Ditolak' ? 'bg-red-50 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {booking.status === 'Ditolak' ? 'Ditolak' : 'Selesai'}
                                            </span>
                                            {booking.status === 'Ditolak' && booking.rejectionReason && (
                                                <div className="mt-1.5 flex items-start gap-1.5 text-xs text-red-600 bg-red-50 rounded-lg px-2.5 py-1.5 max-w-xs">
                                                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                                    <span>{booking.rejectionReason}</span>
                                                </div>
                                            )}
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
                    )}
                    <div className={`p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 ${viewMode === 'grid' ? 'grid' : 'grid md:hidden'}`}>
                            {filteredBookings.map((booking) => (
                                <div key={booking.id} className={`bg-white border rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow relative ${isPending ? 'opacity-50' : ''}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                <Box className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 break-words" title={booking.room.name}>{booking.room.name}</p>
                                                <p className="text-xs text-gray-500">{new Date(booking.startTime).toLocaleDateString('id-ID')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <User className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span className="break-words" title={booking.user.fullName}>{booking.user.fullName} ({booking.user.identifier})</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-auto pt-2">
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${booking.status === 'Ditolak' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {booking.status === 'Ditolak' ? 'Ditolak' : 'Selesai'}
                                            </span>
                                            {booking.status === 'Ditolak' && booking.rejectionReason && (
                                                <div className="flex items-start gap-1 text-xs text-red-600 mt-1 max-w-[200px]" title={booking.rejectionReason}>
                                                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                                    <span className="truncate">{booking.rejectionReason}</span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteBooking(booking.id)}
                                            disabled={isPending}
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Hapus Riwayat"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredBookings.length === 0 && (
                                <div className="col-span-full py-12 text-center text-gray-500 border rounded-xl border-dashed">
                                    {searchQuery ? 'Tidak ada hasil pencarian' : 'Tidak ada riwayat selesai'}
                                </div>
                            )}
                        </div>
                </div>
            </div>
        </div>
    );
}
