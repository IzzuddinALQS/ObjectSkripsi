'use client';

import { uploadGovernanceDoc, updateGovernanceDoc } from '@/features/governance/actions';
import { Upload } from 'lucide-react';
import { useState } from 'react';

interface GovernanceUploadFormProps {
    adminId: string;
    allowedTypes: string[];
    initialData?: any;
    onCancel?: () => void;
}

export default function GovernanceUploadForm({ adminId, allowedTypes, initialData, onCancel }: GovernanceUploadFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEdit = !!initialData;

    return (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                {isEdit ? 'Edit Dokumen Tata Kelola' : 'Upload Dokumen Tata Kelola'}
            </h2>
            <form action={async (formData) => {
                setIsSubmitting(true);
                try {
                    let res;
                    if (isEdit) {
                        res = await updateGovernanceDoc(initialData.id, formData);
                    } else {
                        res = await uploadGovernanceDoc(formData);
                    }

                    if (res?.error) {
                        alert(res.error);
                    } else {
                        if (isEdit && onCancel) onCancel();
                        if (!isEdit) {
                            const form = document.getElementById('gov-upload-form') as HTMLFormElement;
                            form?.reset();
                        }
                    }
                } catch (error) {
                    alert('Gagal menyimpan dokumen');
                    console.error(error);
                } finally {
                    setIsSubmitting(false);
                }
            }} id="gov-upload-form" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="hidden" name="adminId" value={adminId} />

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Dokumen</label>
                    <input
                        name="title"
                        defaultValue={initialData?.title}
                        required
                        placeholder="Contoh: SOP Peminjaman Alat"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Dokumen</label>
                    <select
                        name="type"
                        defaultValue={initialData?.type}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        {allowedTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isEdit ? 'File Dokumen (PDF) - Biarkan kosong jika tidak ingin mengubah' : 'File Dokumen (PDF)'}
                    </label>
                    <input
                        type="file"
                        name="file"
                        required={!isEdit}
                        accept=".pdf"
                        className="w-full max-w-full overflow-hidden text-ellipsis px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: PDF. Maks. 2MB</p>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isEdit ? 'Cover Image (Opsional) - Biarkan kosong jika tidak ingin mengubah' : 'Cover Image (Opsional, untuk SOP)'}
                    </label>
                    <input type="file" name="cover" accept="image/*" className="w-full max-w-full overflow-hidden text-ellipsis px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                    <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG. Maks. 2MB. Disarankan rasio 1:1 atau portrait.</p>
                </div>

                <div className="md:col-span-2 flex gap-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#0F4C81] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0F4C81]/90 transition-colors disabled:opacity-50 w-full md:w-auto"
                    >
                        {isSubmitting ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Upload Dokumen')}
                    </button>
                    {isEdit && onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium w-full md:w-auto"
                        >
                            Batal
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
