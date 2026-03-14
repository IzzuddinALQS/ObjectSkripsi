'use client';

import { useState, useTransition } from 'react';
import { Upload, X, Camera, Check } from 'lucide-react';
import { requestItemReturn } from '@/features/loans/actions';
import { useAlert } from '@/components/providers/AlertProvider';

interface ReturnModalProps {
    loanId: number;
    itemName: string;
    onClose: () => void;
}

export default function ReturnModal({ loanId, itemName, onClose }: ReturnModalProps) {
    const { showAlert } = useAlert();
    const [isPending, startTransition] = useTransition();
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [withPhoto, setWithPhoto] = useState(true);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showAlert({ title: 'Peringatan', message: 'Ukuran file maksimal 2MB', type: 'error' });
                e.target.value = '';
                return;
            }
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            let photoPath: string | undefined;

            if (withPhoto && photoFile) {
                // Upload photo first
                const formData = new FormData();
                formData.append('file', photoFile);
                formData.append('folder', 'returns');

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    photoPath = data.path;
                }
            }

            const res = await requestItemReturn(loanId, photoPath);
            if (res?.error) {
                showAlert({ title: 'Gagal', message: res.error, type: 'error' });
            } else {
                onClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Kembalikan Alat</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Alat yang akan dikembalikan:</p>
                        <p className="font-medium text-gray-900">{itemName}</p>
                    </div>

                    {/* Option: with or without photo */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">Metode Pengembalian</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setWithPhoto(true)}
                                className={`p-3 rounded-lg border-2 text-left transition-all ${withPhoto
                                    ? 'border-[#0F4C81] bg-[#0F4C81]/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Camera className={`w-5 h-5 mb-1 ${withPhoto ? 'text-[#0F4C81]' : 'text-gray-400'}`} />
                                <p className={`text-sm font-medium ${withPhoto ? 'text-[#0F4C81]' : 'text-gray-700'}`}>
                                    Dengan Foto
                                </p>
                                <p className="text-xs text-gray-500">Auto-approved</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setWithPhoto(false)}
                                className={`p-3 rounded-lg border-2 text-left transition-all ${!withPhoto
                                    ? 'border-[#0F4C81] bg-[#0F4C81]/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Check className={`w-5 h-5 mb-1 ${!withPhoto ? 'text-[#0F4C81]' : 'text-gray-400'}`} />
                                <p className={`text-sm font-medium ${!withPhoto ? 'text-[#0F4C81]' : 'text-gray-700'}`}>
                                    Tanpa Foto
                                </p>
                                <p className="text-xs text-gray-500">Perlu approval admin</p>
                            </button>
                        </div>
                    </div>

                    {/* Photo upload */}
                    {withPhoto && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Foto Bukti Pengembalian</label>
                            {!photoPreview ? (
                                <label className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-gray-50 transition-colors">
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">Klik untuk upload foto</p>
                                    <p className="text-xs text-gray-400 mt-1">JPG, PNG (Maks. 2MB)</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />
                                </label>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={photoPreview}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPhotoFile(null);
                                            setPhotoPreview(null);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || (withPhoto && !photoFile)}
                            className="flex-1 px-4 py-2.5 bg-[#0F4C81] text-white rounded-lg font-medium hover:bg-[#0F4C81]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? 'Memproses...' : 'Kembalikan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
