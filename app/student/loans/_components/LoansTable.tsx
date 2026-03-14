'use client';

import { useState } from 'react';
import { Box, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import ReturnModal from './ReturnModal';

interface Loan {
    id: number;
    requestDate: string | null;
    returnPlanDate: string;
    status: string | null;
    returnStatus: string | null;
    rejectionReason: string | null;
    item: {
        name: string;
        category: {
            name: string;
        };
    };
}

interface LoansTableProps {
    loans: Loan[];
}

export default function LoansTable({ loans }: LoansTableProps) {
    const [returnModal, setReturnModal] = useState<{ loanId: number; itemName: string } | null>(null);

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            'Pending': 'bg-yellow-50 text-yellow-700',
            'Disetujui': 'bg-green-50 text-green-700',
            'Ditolak': 'bg-red-50 text-red-700',
            'Selesai': 'bg-gray-50 text-gray-700',
            'Terlambat': 'bg-red-50 text-red-700',
        };
        return styles[status] || 'bg-gray-50 text-gray-700';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Pending': return <Clock className="w-4 h-4" />;
            case 'Disetujui': return <CheckCircle className="w-4 h-4" />;
            case 'Ditolak': return <XCircle className="w-4 h-4" />;
            case 'Selesai': return <CheckCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Alat</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Tanggal Pinjam</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Rencana Kembali</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loans.map((loan) => (
                                <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Box className="w-5 h-5 text-primary" />
                                            </div>
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
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusBadge(loan.status!)}`}>
                                            {getStatusIcon(loan.status!)}
                                            {loan.status}
                                        </span>
                                        {loan.status === 'Ditolak' && loan.rejectionReason && (
                                            <div className="mt-1.5 flex items-start gap-1.5 text-xs text-red-600 bg-red-50 rounded-lg px-2.5 py-1.5 max-w-xs">
                                                <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                                <span>{loan.rejectionReason}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {loan.status === 'Disetujui' && loan.returnStatus === 'Belum' && (
                                            <button
                                                onClick={() => setReturnModal({ loanId: loan.id, itemName: loan.item.name })}
                                                className="bg-[#0F4C81] text-white hover:bg-[#0F4C81]/90 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                Kembalikan
                                            </button>
                                        )}
                                        {loan.returnStatus === 'Pending' && (
                                            <span className="text-yellow-600 text-sm font-medium">Menunggu Persetujuan</span>
                                        )}
                                        {loan.returnStatus === 'Dikembalikan' && (
                                            <span className="text-green-600 text-sm font-medium">Sudah Dikembalikan</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {loans.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Belum ada riwayat peminjaman.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Return Modal */}
            {returnModal && (
                <ReturnModal
                    loanId={returnModal.loanId}
                    itemName={returnModal.itemName}
                    onClose={() => setReturnModal(null)}
                />
            )}
        </>
    );
}
