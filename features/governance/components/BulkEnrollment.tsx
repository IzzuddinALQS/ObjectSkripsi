'use client';

import { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import { bulkEnrollUsers, parseCSV, getRoleByName, BulkEnrollmentInput } from '@/features/users/enrollment';

interface BulkEnrollmentProps {
    onSuccess?: () => void;
}

export default function BulkEnrollment({ onSuccess }: BulkEnrollmentProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [preview, setPreview] = useState<BulkEnrollmentInput[]>([]);
    const [roleId, setRoleId] = useState<number | null>(null);
    const [result, setResult] = useState<{ success: number; failed: number; errors: { identifier: string; error: string }[] } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setResult(null);

        // Get Mahasiswa role
        const role = await getRoleByName('Mahasiswa');
        if (!role) {
            setError('Role Mahasiswa tidak ditemukan');
            return;
        }
        setRoleId(role.id);

        const reader = new FileReader();
        reader.onload = async (event) => {
            const csvString = event.target?.result as string;
            try {
                const data = await parseCSV(csvString, role.id);
                if (data.length === 0) {
                    setError('Tidak ada data valid dalam file. Pastikan format CSV benar.');
                    return;
                }
                setPreview(data);
            } catch (err) {
                setError('Gagal membaca file. Pastikan format CSV benar.');
            }
        };
        reader.readAsText(file);
    };

    const handleSubmit = async () => {
        if (preview.length === 0) return;

        setIsLoading(true);
        setError(null);

        try {
            const res = await bulkEnrollUsers(preview);
            setResult(res);
            if (res.success > 0 && onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan saat menyimpan data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setPreview([]);
        setResult(null);
        setError(null);
        const input = document.getElementById('csv-upload') as HTMLInputElement;
        if (input) input.value = '';
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Bulk Enrollment (Pre-registrasi)
            </h2>

            <div className="mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg text-sm text-blue-700 overflow-hidden">
                <p className="font-medium mb-1">Petunjuk:</p>
                <p className="break-words">Upload file CSV dengan format:</p>
                <code className="block mt-1 bg-blue-100 px-2 py-1 rounded text-xs break-all whitespace-normal">fullName,identifier,batch,studyType,programStudi,dosenPembimbing</code>
                <p className="mt-1 text-xs">Baris pertama akan diabaikan (header). User akan berstatus &quot;Pre-registered&quot; dan perlu daftar akun untuk mengaktifkan.</p>
                <p className="mt-1 text-xs text-blue-600"><strong>Tip:</strong> Jika nilai mengandung koma (misal: &quot;Dr. Budi, M.Kom&quot;), bungkus dengan tanda kutip ganda.</p>
            </div>

            {/* File Upload */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV</label>
                <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Result Display */}
            {result && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${result.failed === 0 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Hasil: {result.success} berhasil, {result.failed} gagal</span>
                    </div>
                    {result.errors.length > 0 && (
                        <ul className="text-xs list-disc pl-5">
                            {result.errors.slice(0, 5).map((err, i) => (
                                <li key={i}>{err.identifier}: {err.error}</li>
                            ))}
                            {result.errors.length > 5 && <li>...dan {result.errors.length - 5} lainnya</li>}
                        </ul>
                    )}
                </div>
            )}

            {/* Preview Table */}
            {preview.length > 0 && !result && (
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700">Preview ({preview.length} data)</h3>
                        <button onClick={handleClear} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                            <X className="w-3 h-3" /> Clear
                        </button>
                    </div>
                    <div className="max-h-60 overflow-x-auto overflow-y-auto border rounded-lg">
                        <table className="w-full text-xs">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 text-left">Nama</th>
                                    <th className="px-3 py-2 text-left">NIM</th>
                                    <th className="px-3 py-2 text-left">Angkatan</th>
                                    <th className="px-3 py-2 text-left">Tipe</th>
                                    <th className="px-3 py-2 text-left">Prodi</th>
                                    <th className="px-3 py-2 text-left">Pembimbing</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {preview.slice(0, 10).map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-3 py-2">{row.fullName}</td>
                                        <td className="px-3 py-2">{row.identifier}</td>
                                        <td className="px-3 py-2">{row.batch || '-'}</td>
                                        <td className="px-3 py-2">{row.studyType || 'Reguler'}</td>
                                        <td className="px-3 py-2">{row.programStudi || 'Informatika'}</td>
                                        <td className="px-3 py-2">{row.dosenPembimbing || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {preview.length > 10 && (
                            <div className="text-xs text-center py-2 text-gray-500 bg-gray-50">
                                ...dan {preview.length - 10} data lainnya
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Submit Button */}
            {preview.length > 0 && !result && (
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="bg-[#0F4C81] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0F4C81]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    <FileSpreadsheet className="w-4 h-4" />
                    {isLoading ? 'Menyimpan...' : `Simpan ${preview.length} Data`}
                </button>
            )}

            {/* Reset after success */}
            {result && (
                <button
                    onClick={handleClear}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                    Upload File Baru
                </button>
            )}
        </div>
    );
}
