'use client';

import { useState, useTransition } from 'react';
import { Box, Check, X, Clock, ExternalLink } from 'lucide-react';
import { approveReturn, rejectReturn } from '@/features/loans/actions';

interface PendingReturn {
    id: number;
    requestDate: Date | null;
    returnPlanDate: Date;
    purpose: string | null;
    student: {
        fullName: string;
        identifier: string;
        [key: string]: unknown; // Allow additional student fields
    };
    item: {
        name: string;
        [key: string]: unknown; // Allow additional item fields
    };
    [key: string]: unknown; // Allow additional loan fields
}

interface PendingReturnsListProps {
    returns: PendingReturn[];
    validatorId: string;
}

export default function PendingReturnsList({ returns, validatorId }: PendingReturnsListProps) {
    const [isPending, startTransition] = useTransition();

    const handleApprove = (loanId: number) => {
        startTransition(async () => {
            await approveReturn(loanId, validatorId);
        });
    };

    const handleReject = (loanId: number) => {
        startTransition(async () => {
            await rejectReturn(loanId);
        });
    };

    if (returns.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-12 text-center">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada pengembalian yang menunggu persetujuan</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Pengembalian Menunggu Persetujuan</h3>
                <p className="text-sm text-gray-500">Pengembalian tanpa foto bukti perlu disetujui manual</p>
            </div>
            <div className="divide-y divide-gray-100">
                {returns.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center">
                                    <Box className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{item.item.name}</p>
                                    <p className="text-sm text-gray-500">
                                        Dipinjam oleh: <span className="font-medium">{item.student.fullName}</span>
                                        <span className="text-gray-400"> ({item.student.identifier})</span>
                                    </p>
                                    {item.purpose && (
                                        <p className="text-xs text-gray-400 mt-1">Tujuan: {item.purpose}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleApprove(item.id)}
                                    disabled={isPending}
                                    title="Setujui Pengembalian"
                                    className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleReject(item.id)}
                                    disabled={isPending}
                                    title="Tolak Pengembalian"
                                    className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
