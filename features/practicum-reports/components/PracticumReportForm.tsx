'use client';

import { useState, useTransition } from 'react';
import { X, FileText, Users, Calendar, Clock, MapPin, User } from 'lucide-react';
import { createPracticumReport } from '@/features/practicum-reports/actions';
import type { ScheduledPracticumWithDetails } from '@/features/scheduled-practicum/types';
import type { PracticumCondition } from '@/features/practicum-reports/types';

interface PracticumReportFormProps {
    isOpen: boolean;
    onClose: () => void;
    schedule: ScheduledPracticumWithDetails;
    onSuccess?: () => void;
}

const CONDITION_OPTIONS_LIST: { value: PracticumCondition; label: string }[] = [
    { value: 'Lancar', label: 'Lancar' },
    { value: 'Kurang Lancar', label: 'Kurang Lancar' },
    { value: 'Terkendala', label: 'Terkendala' },
];

export default function PracticumReportForm({ isOpen, onClose, schedule, onSuccess }: PracticumReportFormProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [condition, setCondition] = useState<PracticumCondition | ''>('');

    if (!isOpen) return null;

    const formatDate = (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const fd = new FormData(e.currentTarget);

        const data = {
            scheduledPracticumId: schedule.id,
            courseName: schedule.courseName || '',
            courseCode: schedule.courseCode || '',
            lecturerName: (schedule as any).lecturerName || null,
            roomName: schedule.roomName || '',
            practicumDate: new Date(schedule.scheduledDate),
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            batch: fd.get('batch') as string,
            attendeeCount: parseInt(fd.get('attendeeCount') as string),
            condition: fd.get('condition') as PracticumCondition,
            description: fd.get('description') as string,
            issues: (fd.get('issues') as string) || undefined,
            followUp: (fd.get('followUp') as string) || undefined,
        };

        startTransition(async () => {
            const result = await createPracticumReport(data);
            if (result.success) {
                onSuccess?.();
                onClose();
            } else {
                setError(result.error || 'Gagal menyimpan berita acara');
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[120] p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Isi Berita Acara Praktikum</h3>
                            <p className="text-sm text-blue-600">{schedule.courseCode} - {schedule.courseName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    {/* Info dari Jadwal (Read-only) */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Informasi Jadwal (Otomatis)</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm">
                                <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                                <span className="text-gray-500">Matakuliah:</span>
                                <span className="font-medium text-gray-900">{schedule.courseCode} - {schedule.courseName}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-blue-500 shrink-0" />
                                <span className="text-gray-500">Dosen:</span>
                                <span className="font-medium text-gray-900">{(schedule as any).lecturerName || '-'}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                                <span className="text-gray-500">Tanggal:</span>
                                <span className="font-medium text-gray-900">{formatDate(schedule.scheduledDate)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                                <span className="text-gray-500">Waktu:</span>
                                <span className="font-medium text-gray-900">{schedule.startTime} - {schedule.endTime}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm md:col-span-2">
                                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                                <span className="text-gray-500">Ruang Lab:</span>
                                <span className="font-medium text-gray-900">{schedule.roomName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* Angkatan */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Angkatan <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="batch"
                                required
                                placeholder="Contoh: 2023, 2022-2023"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                            />
                        </div>

                        {/* Jumlah Mahasiswa Hadir */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Jumlah Mahasiswa Hadir <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="attendeeCount"
                                    required
                                    min="0"
                                    placeholder="0"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                                />
                            </div>
                        </div>

                        {/* Kondisi Praktikum */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kondisi Praktikum <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {CONDITION_OPTIONS_LIST.map((opt) => (
                                    <label
                                        key={opt.value}
                                        className={`
                                            flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all
                                            ${condition === opt.value
                                                ? opt.value === 'Lancar'
                                                    ? 'bg-green-50 border-green-500 text-green-700'
                                                    : opt.value === 'Kurang Lancar'
                                                        ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                                                        : 'bg-red-50 border-red-500 text-red-700'
                                                : 'bg-white border-gray-200 hover:border-gray-300'
                                            }
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="condition"
                                            value={opt.value}
                                            required
                                            checked={condition === opt.value}
                                            onChange={(e) => setCondition(e.target.value as PracticumCondition)}
                                            className="sr-only"
                                        />
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                                            ${condition === opt.value
                                                ? opt.value === 'Lancar' ? 'border-green-500'
                                                    : opt.value === 'Kurang Lancar' ? 'border-yellow-500'
                                                        : 'border-red-500'
                                                : 'border-gray-300'
                                            }
                                        `}>
                                            {condition === opt.value && (
                                                <div className={`w-2 h-2 rounded-full
                                                    ${opt.value === 'Lancar' ? 'bg-green-500'
                                                        : opt.value === 'Kurang Lancar' ? 'bg-yellow-500'
                                                            : 'bg-red-500'
                                                    }
                                                `} />
                                            )}
                                        </div>
                                        <span className="text-sm font-medium">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Deskripsi Pelaksanaan */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Deskripsi Singkat Pelaksanaan <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                required
                                rows={3}
                                maxLength={2000}
                                placeholder="Deskripsikan secara singkat bagaimana pelaksanaan praktikum hari ini..."
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none"
                            />
                        </div>

                        {/* Kendala */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kendala <span className="text-gray-400 text-xs">(Opsional)</span>
                            </label>
                            <textarea
                                name="issues"
                                rows={2}
                                maxLength={2000}
                                placeholder="Tuliskan kendala yang dihadapi selama praktikum (jika ada)..."
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none"
                            />
                        </div>

                        {/* Tindak Lanjut */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tindak Lanjut <span className="text-gray-400 text-xs">(Opsional)</span>
                            </label>
                            <textarea
                                name="followUp"
                                rows={2}
                                maxLength={2000}
                                placeholder="Tuliskan tindak lanjut yang diperlukan (jika ada)..."
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isPending ? 'Menyimpan...' : 'Simpan Berita Acara'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
