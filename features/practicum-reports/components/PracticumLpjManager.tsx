'use client';

import { useState, useTransition } from 'react';
import { Upload, FileText, Trash2, Download, X, ChevronDown, ChevronUp } from 'lucide-react';
import { uploadPracticumLpjDoc, deletePracticumLpjDoc } from '@/features/practicum-reports/lpj-actions';

const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

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

interface PracticumLpjManagerProps {
    scheduledPracticumId: number;
    courseName: string;
    initialDocs: LpjDoc[];
    currentUserId: string;
}

export default function PracticumLpjManager({
    scheduledPracticumId,
    courseName,
    initialDocs,
    currentUserId,
}: PracticumLpjManagerProps) {
    const [isPending, startTransition] = useTransition();
    const [docs, setDocs] = useState(initialDocs);
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const now = new Date();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [periodMonth, setPeriodMonth] = useState(now.getMonth() + 1);
    const [periodYear, setPeriodYear] = useState(now.getFullYear());
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) { setMessage({ type: 'error', text: 'Pilih file terlebih dahulu' }); return; }

        const fd = new FormData();
        fd.append('file', file);
        fd.append('title', title);
        fd.append('description', description);
        fd.append('scheduledPracticumId', String(scheduledPracticumId));
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
                // Refresh list — simple window reload for now
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

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900 text-sm">LPJ Praktikum</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{courseName}</p>
                </div>
                <button
                    onClick={() => { setShowForm(v => !v); setMessage(null); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                    {showForm ? <ChevronUp className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                    {showForm ? 'Tutup' : 'Upload LPJ'}
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <span className="flex-1">{message.text}</span>
                    <button onClick={() => setMessage(null)}><X className="w-3.5 h-3.5" /></button>
                </div>
            )}

            {/* Upload Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                    <h4 className="font-medium text-gray-800 text-sm">Upload LPJ Baru</h4>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Judul LPJ *</label>
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
                            <label className="block text-xs font-medium text-gray-600 mb-1">Bulan *</label>
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
                            <label className="block text-xs font-medium text-gray-600 mb-1">Tahun *</label>
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
                        <label className="block text-xs font-medium text-gray-600 mb-1">Keterangan</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={2}
                            placeholder="Keterangan tambahan (opsional)"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">File LPJ * <span className="text-gray-400">(PDF/DOC/DOCX, maks 10MB)</span></label>
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
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            {isPending ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
                            {isPending ? 'Mengunggah...' : 'Upload'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            )}

            {/* Document List */}
            {docs.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Belum ada LPJ yang diunggah</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {docs.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-2.5 gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="p-1.5 bg-blue-50 rounded-lg shrink-0">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                                    <p className="text-xs text-gray-500">{MONTHS[doc.periodMonth - 1]} {doc.periodYear} · {doc.uploaderName || 'Unknown'}</p>
                                </div>
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
                                {(doc.uploaderId === currentUserId) && (
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
                    ))}
                </div>
            )}
        </div>
    );
}
