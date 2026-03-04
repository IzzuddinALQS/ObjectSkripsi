'use client';

import { useState, useMemo, useTransition } from 'react';
import { Box, User, CheckCircle, XCircle, Search, X } from 'lucide-react';
import { updateLoanStatus, approveReturn as approveReturnAction, rejectReturn as rejectReturnAction, adminDirectReturn } from '@/features/loans/actions';

interface Loan {
    id: number;
    status: string | null;
    requestDate: Date | null;
    returnPlanDate: Date;
    returnStatus: string | null;
    student: {
        fullName: string;
        identifier: string;
    };
    item: {
        name: string;
        category: {
            name: string;
        };
    };
}

interface PendingReturn {
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

interface SearchableLoansProps {
    loans: Loan[];
    pendingReturns: PendingReturn[];
    sessionUserId: string;
}

export default function SearchableLoansSection({ loans, pendingReturns, sessionUserId }: SearchableLoansProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isPending, startTransition] = useTransition();

    // Filter active loans (Pending + Disetujui)
    const activeLoans = useMemo(() => {
        return loans.filter(l => l.status === 'Pending' || l.status === 'Disetujui');
    }, [loans]);

    const filteredLoans = useMemo(() => {
        if (!searchQuery) return activeLoans;
        const query = searchQuery.toLowerCase();
        return activeLoans.filter(loan =>
            loan.student.fullName.toLowerCase().includes(query) ||
            loan.student.identifier.toLowerCase().includes(query) ||
            loan.item.name.toLowerCase().includes(query)
        );
    }, [activeLoans, searchQuery]);

    const filteredReturns = useMemo(() => {
        if (!searchQuery) return pendingReturns;
        const query = searchQuery.toLowerCase();
        return pendingReturns.filter(loan =>
            loan.student.fullName.toLowerCase().includes(query) ||
            loan.student.identifier.toLowerCase().includes(query) ||
            loan.item.name.toLowerCase().includes(query)
        );
    }, [pendingReturns, searchQuery]);

    const pendingLoansCount = activeLoans.filter(l => l.status === 'Pending').length;
    const approvedLoansCount = activeLoans.filter(l => l.status === 'Disetujui').length;

    const handleApprove = (loanId: number) => {
        startTransition(async () => {
            await updateLoanStatus(loanId, 'Disetujui', sessionUserId);
        });
    };

    const handleReject = (loanId: number) => {
        startTransition(async () => {
            await updateLoanStatus(loanId, 'Ditolak', sessionUserId);
        });
    };

    // Admin directly returns an active loan (no need for student to submit return first)
    const handleReturn = (loanId: number) => {
        startTransition(async () => {
            await adminDirectReturn(loanId, sessionUserId);
        });
    };

    const handleApproveReturn = (loanId: number) => {
        startTransition(async () => {
            await approveReturnAction(loanId, sessionUserId);
        });
    };

    const handleRejectReturn = (loanId: number) => {
        startTransition(async () => {
            await rejectReturnAction(loanId);
        });
    };

    return (
        <div>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-500 mt-2">{pendingLoansCount}</p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Aktif</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">{approvedLoansCount}</p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Pending Return</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">{pendingReturns.length}</p>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama mahasiswa atau alat..."
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
                    <p className="text-sm text-gray-500 mt-2">
                        Menampilkan {filteredLoans.length} peminjaman, {filteredReturns.length} pengembalian
                    </p>
                )}
            </div>

            {/* Section 1: Peminjaman Table */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Peminjaman</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Mahasiswa</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Alat</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Tanggal Pinjam</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Rencana Kembali</th>
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
                                            <Box className="w-4 h-4 text-[#0F4C81]" />
                                            <div>
                                                <p className="font-medium text-gray-900">{loan.item.name}</p>
                                                <p className="text-xs text-gray-500">{loan.item.category.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                        {loan.requestDate ? new Date(loan.requestDate).toLocaleDateString('id-ID') : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                        {new Date(loan.returnPlanDate).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${loan.status === 'Pending' ? 'bg-yellow-50 text-yellow-700' :
                                            loan.status === 'Disetujui' ? 'bg-green-50 text-green-700' :
                                                'bg-red-50 text-red-700'
                                            }`}>
                                            {loan.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {loan.status === 'Pending' && (
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => handleApprove(loan.id)}
                                                    disabled={isPending}
                                                    className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(loan.id)}
                                                    disabled={isPending}
                                                    className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                        {loan.status === 'Disetujui' && (
                                            <button
                                                onClick={() => handleReturn(loan.id)}
                                                disabled={isPending}
                                                className="mx-auto flex items-center justify-center gap-1 px-3 py-1.5 bg-[#0F4C81] text-white rounded-lg text-sm hover:bg-[#0F4C81]/90 transition-colors disabled:opacity-50"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Kembalikan
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredLoans.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada permintaan peminjaman.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 2: Pengembalian Barang */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📦 Pengembalian Barang
                <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredReturns.length} menunggu validasi)
                </span>
            </h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Mahasiswa</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Alat</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Tanggal Pinjam</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredReturns.map((loan) => (
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
                                            <Box className="w-4 h-4 text-[#0F4C81]" />
                                            <p className="font-medium text-gray-900">{loan.item.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                        {loan.requestDate ? new Date(loan.requestDate).toLocaleDateString('id-ID') : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-orange-50 text-orange-700">
                                            Pending Return
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => handleApproveReturn(loan.id)}
                                                disabled={isPending}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleRejectReturn(loan.id)}
                                                disabled={isPending}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredReturns.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        {searchQuery ? 'Tidak ada hasil pencarian' : 'Tidak ada permintaan pengembalian.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
