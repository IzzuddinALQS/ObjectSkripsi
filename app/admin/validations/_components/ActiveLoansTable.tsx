'use client';

import { useState, useTransition } from 'react';
import { Box, User, CheckCircle, XCircle, Eye, X, ExternalLink } from 'lucide-react';
import { updateLoanStatus, adminDirectReturn } from '@/features/loans/actions';
import { useAlert } from '@/components/providers/AlertProvider';
import { translateError } from '@/lib/error';

interface Loan {
    id: number;
    status: string | null;
    requestDate: Date | null;
    returnPlanDate: Date;
    returnStatus: string | null;
    organisasi?: string | null;
    purpose?: string | null;
    dosenPembimbing?: string | null;
    suratIzin?: string | null;
    startTime?: Date | null;
    endTime?: Date | null;
    software?: string | null;
    student: { fullName: string; identifier: string; phoneNumber?: string | null };
    item: { name: string; category: { name: string; }; };
}

interface ActiveLoansTableProps {
    loans: Loan[];
    sessionUserId: string;
}

export default function ActiveLoansTable({ loans, sessionUserId }: ActiveLoansTableProps) {
    const { showConfirm, showAlert } = useAlert();
    const [isPending, startTransition] = useTransition();
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

    const handleApprove = (loanId: number) => {
        startTransition(async () => {
            await updateLoanStatus(loanId, 'Disetujui', sessionUserId);
        });
    };

    const handleReject = async (loanId: number) => {
        const confirmed = await showConfirm({
            title: 'Tolak Peminjaman',
            message: 'Tolak permintaan pinjaman ini?',
            type: 'danger',
            confirmText: 'Tolak'
        });
        if (!confirmed) return;
        startTransition(async () => {
            try {
                await updateLoanStatus(loanId, 'Ditolak', sessionUserId);
                showAlert({ title: 'Berhasil', message: 'Permintaan pinjaman ditolak', type: 'success' });
            } catch (error: any) {
                const { title, message } = translateError(error, 'Gagal menolak peminjaman');
                showAlert({ title, message, type: 'error' });
            }
        });
    };

    const handleReturn = async (loanId: number) => {
        const confirmed = await showConfirm({
            title: 'Konfirmasi Pengembalian',
            message: 'Konfirmasi pengembalian alat?',
            type: 'warning',
            confirmText: 'Konfirmasi'
        });
        if (!confirmed) return;
        startTransition(async () => {
            try {
                await adminDirectReturn(loanId, sessionUserId);
                showAlert({ title: 'Berhasil', message: 'Alat berhasil dikembalikan', type: 'success' });
            } catch (error: any) {
                const { title, message } = translateError(error, 'Gagal memproses pengembalian');
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
                            <th className="px-6 py-4 font-semibold text-gray-700">Mahasiswa</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Alat</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Tanggal Pinjam</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Rencana Kembali</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loans.map((loan) => (
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
                                    {new Date(loan.requestDate!).toLocaleDateString('id-ID')}
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
                                    <div className="flex items-center justify-center gap-1">
                                        {/* View Details Button */}
                                        <button
                                            onClick={() => setSelectedLoan(loan)}
                                            className="text-[#0F4C81] hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Lihat Detail"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        {loan.status === 'Pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(loan.id)}
                                                    disabled={isPending}
                                                    className="text-green-600 hover:text-green-700 p-1.5 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Setujui"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(loan.id)}
                                                    disabled={isPending}
                                                    className="text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Tolak"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        {loan.status === 'Disetujui' && (
                                            <button
                                                onClick={() => handleReturn(loan.id)}
                                                disabled={isPending}
                                                className="flex items-center gap-1 ml-2 px-3 py-1.5 bg-[#0F4C81] text-white rounded-lg text-sm hover:bg-[#0F4C81]/90 transition-colors disabled:opacity-50"
                                                title="Konfirmasi Pengembalian"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Kembalikan
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {loans.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Belum ada permintaan peminjaman.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Detail Peminjaman */}
            {selectedLoan && (
                <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Box className="w-5 h-5 text-[#0F4C81]" />
                                Detail Peminjaman
                            </h3>
                            <button
                                onClick={() => setSelectedLoan(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Data Pemohon */}
                            <div>
                                <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">Data Pemohon</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Nama Lengkap</p>
                                        <p className="font-medium text-gray-900">{selectedLoan.student.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">NIM / Identifier</p>
                                        <p className="font-medium text-gray-900">{selectedLoan.student.identifier}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Nomor HP</p>
                                        <p className="font-medium text-gray-900">{selectedLoan.student.phoneNumber || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Dosen Pembimbing</p>
                                        <p className="font-medium text-gray-900">{selectedLoan.dosenPembimbing || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Peminjaman */}
                            <div>
                                <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">Data Alat & Waktu</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Alat (Kategori)</p>
                                        <p className="font-medium text-gray-900">{selectedLoan.item.name} ({selectedLoan.item.category.name})</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Organisasi / Unit</p>
                                        <p className="font-medium text-gray-900">{selectedLoan.organisasi || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Rentang Peminjaman</p>
                                        <p className="font-medium text-gray-900">
                                            {selectedLoan.startTime ? new Date(selectedLoan.startTime).toLocaleDateString('id-ID') : new Date(selectedLoan.requestDate!).toLocaleDateString('id-ID')}
                                            {' - '}
                                            {new Date(selectedLoan.returnPlanDate).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Jam Peminjaman</p>
                                        <p className="font-medium text-gray-900">
                                            {selectedLoan.startTime ? new Date(selectedLoan.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            {' s.d '}
                                            {selectedLoan.endTime ? new Date(selectedLoan.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500">Keperluan</p>
                                        <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 border border-gray-100">{selectedLoan.purpose || '-'}</p>
                                    </div>
                                    {selectedLoan.software && (
                                        <div className="col-span-2">
                                            <p className="text-gray-500">Software yang dipesan</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {(() => {
                                                    try {
                                                        const sw = JSON.parse(selectedLoan.software);
                                                        return Array.isArray(sw) ? sw.map((s, idx) => (
                                                            <span key={idx} className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">{s}</span>
                                                        )) : <span className="text-gray-900">{selectedLoan.software}</span>;
                                                    } catch {
                                                        return <span className="text-gray-900">{selectedLoan.software}</span>;
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dokumen */}
                            {selectedLoan.suratIzin && (
                                <div>
                                    <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">Dokumen Tambahan</h4>
                                    <div className="text-sm border border-gray-100 p-4 rounded-xl bg-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ExternalLink className="w-5 h-5 text-gray-400" />
                                            <span className="font-medium text-gray-900">Surat Izin / Permohonan</span>
                                        </div>
                                        <a href={selectedLoan.suratIzin} target="_blank" rel="noopener noreferrer" className="text-[#0F4C81] hover:underline font-medium">Buka File</a>
                                    </div>
                                </div>
                            )}

                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setSelectedLoan(null)}
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
