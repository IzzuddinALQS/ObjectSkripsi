'use client';

import { useState, useTransition } from 'react';
import { Upload, FileText, Trash2, Download, X, ChevronDown } from 'lucide-react';
import { uploadPracticumLpjDoc, deletePracticumLpjDoc } from '@/features/practicum-reports/lpj-actions';

const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

interface Schedule {
    id: number;
    courseName: string;
    courseCode: string;
}

interface LpjDoc {
    id: number;
    scheduledPracticumId: number;
    title: string;
    description: string | null;
    filePath: string;
    periodMonth: number;
    periodYear: number;
    createdAt: Date | null;
    uploaderName: string | null;
    uploaderId: string;
}

interface AllPracticumLpjManagerProps {
    schedules: Schedule[];
    initialDocs: LpjDoc[];
    currentUserId: string;
    isAdmin?: boolean;
}

export default function AllPracticumLpjManager({
    schedules,
    initialDocs,
    currentUserId,
    isAdmin = false,
}: AllPracticumLpjManagerProps) {
    const [isPending, startTransition] = useTransition();
    const [docs, setDocs] = useState(initialDocs);
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const now = new Date();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
    const [periodMonth, setPeriodMonth] = useState(now.getMonth() + 1);
    const [periodYear, setPeriodYear] = useState(now.getFullYear());
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) { setMessage({ type: 'error', text: 'Pilih file terlebih dahulu' }); return; }
        if (!selectedScheduleId) { setMessage({ type: 'error', text: 'Pilih jadwal praktikum' }); return; }

        const fd = new FormData();
        fd.append('file', file);
        fd.append('title', title);
        fd.append('description', description);
        fd.append('scheduledPracticumId', selectedScheduleId);
        fd.append('periodMonth', String(periodMonth));
        fd.append('periodYear', String(periodYear));

        startTransition(async () => {
            const res = await uploadPracticumLpjDoc(fd);
            if (res.success) {
                setMessage({ type: 'success', text: 'LPJ berhasil diunggah!' });
                setShowForm(false);
                setTitle('');
                setDescription('');
                setFile(null);
                setSelectedScheduleId('');
                window.location.reload();
            } else {
                setMessage({ type: 'error', text: res.error || 'Gagal mengunggah' });
            }
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Hapus dokumen LPJ ini?')) return;
        startTransition(async () => {
            const res = await deletePracticumLpjDoc(id);
            if (res.success) {
                setDocs(prev => prev.filter(d => d.id !== id));
                setMessage({ type: 'success', text: 'Dokumen berhasil dihapus' });
            } else {
                setMessage({ type: 'error', text: res.error || 'Gagal menghapus' });
            }
        });
    };

    const currentYear = now.getFullYear();
    const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    const scheduleMap = new Map(schedules.map(s => [s.id, s]));

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">LPJ Praktikum</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Laporan pertanggungjawaban per jadwal praktikum</p>
                </div>
                <button
                    onClick={() => { setShowForm(v => !v); setMessage(null); }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    {showForm ? <X className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                    {showForm ? 'Tutup Form' : 'Upload LPJ Baru'}
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    <span className="flex-1">{message.text}</span>
                    <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Upload Form */}
            {showForm && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                    <h3 className="font-semibold text-gray-800">Form Upload LPJ</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jadwal Praktikum *</label>
                            <select
                                value={selectedScheduleId}
                                onChange={e => setSelectedScheduleId(e.target.value)}
                                required
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Pilih Jadwal --</option>
                                {schedules.map(s => (
                                    <option key={s.id} value={s.id}>{s.courseCode} – {s.courseName}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Judul LPJ *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                placeholder="Contoh: LPJ Praktikum Basis Data Mei 2026"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bulan *</label>
                                <select
                                    value={periodMonth}
                                    onChange={e => setPeriodMonth(parseInt(e.target.value))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {MONTHS.map((m, i) => (
                                        <option key={i + 1} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun *</label>
                                <select
                                    value={periodYear}
                                    onChange={e => setPeriodYear(parseInt(e.target.value))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={2}
                                placeholder="Keterangan tambahan (opsional)"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                File LPJ * <span className="text-gray-400 font-normal">(PDF/DOC/DOCX, maks 10MB)</span>
                            </label>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={e => setFile(e.target.files?.[0] || null)}
                                required
                                className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>

                        <div className="flex gap-2 pt-1">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                {isPending
                                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : <Upload className="w-4 h-4" />
                                }
                                {isPending ? 'Mengunggah...' : 'Upload LPJ'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setMessage(null); }}
                                className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Document List */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {docs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                            <FileText className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium text-sm">Belum ada LPJ</p>
                        <p className="text-gray-400 text-xs mt-1">Klik "Upload LPJ Baru" untuk mulai mengunggah</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {docs.map(doc => {
                            const sched = scheduleMap.get(doc.scheduledPracticumId);
                            const canDelete = isAdmin || doc.uploaderId === currentUserId;
                            return (
                                <div key={doc.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                                    <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                                            <span className="text-xs text-blue-700 font-medium">
                                                {sched ? `${sched.courseCode} – ${sched.courseName}` : `Jadwal #${doc.scheduledPracticumId}`}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {MONTHS[doc.periodMonth - 1]} {doc.periodYear}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                oleh {doc.uploaderName || 'Unknown'}
                                            </span>
                                        </div>
                                        {doc.description && (
                                            <p className="text-xs text-gray-500 mt-0.5 truncate">{doc.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <a
                                            href={doc.filePath}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Unduh"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                        {canDelete && (
                                            <button
                                                onClick={() => handleDelete(doc.id)}
                                                disabled={isPending}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
