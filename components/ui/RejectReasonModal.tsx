'use client';

import { useState } from 'react';
import { XCircle, X } from 'lucide-react';

interface RejectReasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    title?: string;
    isPending?: boolean;
}

export default function RejectReasonModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Tolak Pengajuan',
    isPending = false,
}: RejectReasonModalProps) {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(reason.trim());
        setReason('');
    };

    const handleClose = () => {
        setReason('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col relative z-10 animate-in zoom-in-95 fade-in duration-200">
                <button
                    onClick={handleClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 pt-8 flex flex-col items-center text-center">
                    <XCircle className="w-12 h-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
                    <p className="text-gray-600 mb-4">
                        Apakah Anda yakin ingin menolak pengajuan ini?
                    </p>

                    <div className="w-full text-left mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Alasan Penolakan <span className="text-gray-400 font-normal">(opsional)</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Masukkan alasan penolakan..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none placeholder:text-gray-400"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row w-full gap-3 sm:justify-center">
                        <button
                            onClick={handleClose}
                            disabled={isPending}
                            className="px-6 py-2 rounded-lg font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 outline-none w-full sm:w-auto"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isPending}
                            className="px-6 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 outline-none w-full sm:w-auto disabled:opacity-50"
                        >
                            {isPending ? 'Memproses...' : 'Tolak'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
