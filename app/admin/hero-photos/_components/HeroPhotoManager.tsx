'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon, X, Loader2, Upload } from 'lucide-react';
import { addHeroPhoto, updateHeroPhoto, deleteHeroPhoto } from '@/features/hero-photos/actions';
import { useAlert } from '@/components/providers/AlertProvider';
import { translateError } from '@/lib/error';

interface HeroPhoto {
    id: number;
    title: string;
    description: string | null;
    imageUrl: string;
    focalX: number;
    focalY: number;
    link: string | null;
}

import HeroFocalPicker from './HeroFocalPicker';

export default function HeroPhotoManager({ initialPhotos }: { initialPhotos: HeroPhoto[] }) {
    const { showAlert, showConfirm } = useAlert();
    const [photos, setPhotos] = useState(initialPhotos);
    const [editingPhoto, setEditingPhoto] = useState<HeroPhoto | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        link: '',
        focalX: 50,
        focalY: 50
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isFocalPickerOpen, setIsFocalPickerOpen] = useState(false);

    const handleEdit = (photo: HeroPhoto) => {
        setEditingPhoto(photo);
        setFormData({
            title: photo.title,
            description: photo.description || '',
            link: photo.link || '',
            focalX: photo.focalX || 50,
            focalY: photo.focalY || 50
        });
        setPreviewUrl(photo.imageUrl);
        setSelectedFile(null);
        setIsFocalPickerOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingPhoto(null);
        setFormData({ title: '', description: '', link: '', focalX: 50, focalY: 50 });
        setPreviewUrl('');
        setSelectedFile(null);
        setIsFocalPickerOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showAlert({ title: 'Ukuran Terlalu Besar', message: 'Ukuran file maksimal 2MB', type: 'error' });
                e.target.value = '';
                return;
            }
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setIsFocalPickerOpen(true); // Auto-open for new files
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('link', formData.link);
            data.append('focalX', formData.focalX.toString());
            data.append('focalY', formData.focalY.toString());

            if (selectedFile) {
                data.append('file', selectedFile);
            }

            if (editingPhoto) {
                await updateHeroPhoto(editingPhoto.id, data);
            } else {
                if (!selectedFile) {
                    showAlert({ title: 'Peringatan', message: 'Mohon pilih foto terlebih dahulu', type: 'warning' });
                    setIsLoading(false);
                    return;
                }
                await addHeroPhoto(data);
            }
            window.location.reload();
        } catch (error: any) {
            console.error('Failed to save photo:', error);
            const { title, message } = translateError(error, 'Gagal menyimpan foto');
            showAlert({ title, message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm({
            title: 'Hapus Foto',
            message: 'Apakah Anda yakin ingin menghapus foto ini?',
            type: 'danger',
            confirmText: 'Hapus'
        });
        if (!confirmed) return;
        
        try {
            await deleteHeroPhoto(id);
            setPhotos(photos.filter(p => p.id !== id));
            await showAlert({ title: 'Berhasil', message: 'Foto berhasil dihapus', type: 'success' });
        } catch (error: any) {
            console.error('Failed to delete photo:', error);
            const { title, message } = translateError(error, 'Gagal menghapus foto');
            showAlert({ title, message, type: 'error' });
        }
    };

    return (
        <div>
            {/* Upload Form - Styled like GovernanceUploadForm */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    {editingPhoto ? 'Edit Foto Hero' : 'Upload Foto Hero Baru'}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Judul Foto</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Contoh: Kegiatan Workshop"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {editingPhoto ? 'Foto (Opsional) - Biarkan kosong jika tidak ingin mengubah' : 'Foto'}
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                required={!editingPhoto}
                            />
                            {previewUrl ? (
                                <div className="relative h-40 w-full">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover rounded-lg"
                                        style={{ objectPosition: `${formData.focalX}% ${formData.focalY}%` }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg text-white text-sm font-medium">
                                        Ganti Foto
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8">
                                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Klik atau drag foto ke sini</p>
                                    <p className="text-xs text-gray-400 mt-1">Maksimal 2MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Focal Picker Section */}
                    {previewUrl && !isFocalPickerOpen && (
                        <div className="md:col-span-2">
                            <button
                                type="button"
                                onClick={() => setIsFocalPickerOpen(true)}
                                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 rounded-lg font-medium transition-colors"
                            >
                                <span className="text-xl">⛶</span> Atur Area Fokus Gambar
                            </button>
                        </div>
                    )}

                    {previewUrl && isFocalPickerOpen && (
                        <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-semibold text-gray-800">Menyesuaikan Titik Fokus</label>
                                <button
                                    type="button"
                                    onClick={() => setIsFocalPickerOpen(false)}
                                    className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded-md shadow-sm hover:bg-gray-100 font-medium"
                                >
                                    Selesai Atur Fokus
                                </button>
                            </div>
                            <HeroFocalPicker
                                imageUrl={previewUrl}
                                initialFocalX={formData.focalX}
                                initialFocalY={formData.focalY}
                                onChange={(x, y) => setFormData(prev => ({ ...prev, focalX: x, focalY: y }))}
                            />
                        </div>
                    )}

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link / URL (Opsional)</label>
                        <input
                            type="url"
                            value={formData.link}
                            onChange={e => setFormData({ ...formData, link: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="https://example.com/detail-kegiatan"
                        />
                        <p className="text-xs text-gray-500 mt-1">Jika diisi, foto akan mengarah ke link ini saat diklik.</p>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 h-24 resize-none"
                            placeholder="Deskripsi singkat kegiatan..."
                        />
                    </div>

                    <div className="md:col-span-2 flex gap-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[#0F4C81] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0F4C81]/90 transition-colors disabled:opacity-50 w-full md:w-auto flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editingPhoto ? 'Simpan Perubahan' : 'Upload Foto'}
                        </button>
                        {editingPhoto && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium w-full md:w-auto"
                            >
                                Batal
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Photo List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map((photo) => (
                    <div key={photo.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group">
                        <div className="relative h-48 w-full bg-gray-100">
                            {photo.imageUrl ? (
                                <img
                                    src={photo.imageUrl}
                                    alt={photo.title}
                                    className="w-full h-full object-cover"
                                    style={{ objectPosition: `${photo.focalX}% ${photo.focalY}%` }}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <ImageIcon className="w-8 h-8" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() => handleEdit(photo)}
                                    className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-lg backdrop-blur-sm transition-colors"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(photo.id)}
                                    className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-500 hover:text-red-100 rounded-lg backdrop-blur-sm transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-1">{photo.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">{photo.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
