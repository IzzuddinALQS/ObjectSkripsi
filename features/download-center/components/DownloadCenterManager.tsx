'use client';

import { useState, useTransition } from 'react';
import { Download, Upload, Trash2, FileText } from 'lucide-react';
import { deleteDownloadCenterDoc, uploadDownloadCenterDoc } from '@/features/download-center/actions';

interface DownloadDoc {
    id: number;
    title: string;
    filePath: string;
    createdAt: Date | null;
    uploaderName: string | null;
}

interface Props {
    docs: DownloadDoc[];
    adminId: string;
    canManage: boolean;
}

function formatDate(date: Date | null) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function DownloadCenterManager({ docs, adminId, canManage }: Props) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleUpload = (formData: FormData) => {
        startTransition(async () => {
            const result = await uploadDownloadCenterDoc(formData);
            if (result.success) {
                setMessage({ type: 'success', text: 'Dokumen berhasil diupload' });
            } else {
                setMessage({ type: 'error', text: result.error || 'Upload gagal' });
            }
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Hapus dokumen ini dari Pusat Download?')) return;
        startTransition(async () => {
            const result = await deleteDownloadCenterDoc(id);
            if (result.success) {
                setMessage({ type: 'success', text: 'Dokumen berhasil dihapus' });
            } else {
                setMessage({ type: 'error', text: result.error || 'Hapus gagal' });
            }
        });
    };

    return (
        <div className="space-y-6">
            {message && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {canManage && (
                <form action={handleUpload} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload Dokumen
                    </h2>
                    <input type="hidden" name="adminId" value={adminId} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            name="title"
                            type="text"
                            placeholder="Judul dokumen"
                            required
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20"
                        />
                        <input
                            name="file"
                            type="file"
                            required
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                    </div>
                    <div className="text-xs text-gray-500">Maksimal ukuran file 10MB.</div>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F4C81] text-white rounded-lg text-sm font-medium hover:bg-[#0D3F6B] disabled:opacity-50"
                    >
                        <Upload className="w-4 h-4" />
                        {isPending ? 'Memproses...' : 'Upload ke Pusat Download'}
                    </button>
                </form>
            )}

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">Daftar Dokumen</h2>
                </div>

                {docs.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 text-sm">Belum ada dokumen di Pusat Download.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {docs.map((doc) => (
                            <div key={doc.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 break-words flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        {doc.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Upload: {formatDate(doc.createdAt)}
                                        {doc.uploaderName ? ` • Oleh ${doc.uploaderName}` : ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={doc.filePath}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-800"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </a>
                                    {canManage && (
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-red-50 hover:bg-red-100 text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Hapus
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
