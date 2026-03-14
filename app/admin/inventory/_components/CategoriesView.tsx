'use client';

import { createCategory, deleteCategory, updateCategory } from '@/features/inventory/actions';
import { Plus, Trash2, Tags, Pencil, X, Check } from 'lucide-react';
import { useState } from 'react';
import { useAlert } from '@/components/providers/AlertProvider';
import { translateError } from '@/lib/error';

interface Category {
    id: number;
    name: string;
}

interface CategoriesViewProps {
    categories: Category[];
}

export default function CategoriesView({ categories }: CategoriesViewProps) {
    const { showAlert, showConfirm } = useAlert();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');

    const handleEditClick = (category: Category) => {
        setEditingId(category.id);
        setEditName(category.name);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName('');
    };

    const handleSaveEdit = async (id: number) => {
        if (!editName.trim()) return;

        try {
            const result = await updateCategory(id, { name: editName });
            if (result.success) {
                setEditingId(null);
                setEditName('');
                showAlert({ title: 'Berhasil', message: 'Kategori berhasil diperbarui', type: 'success' });
            } else {
                showAlert({ title: 'Gagal', message: result.error || 'Gagal memperbarui kategori', type: 'error' });
            }
        } catch (error: any) {
            const { title, message } = translateError(error);
            showAlert({ title, message, type: 'error' });
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm({
            title: 'Hapus Kategori',
            message: 'Apakah Anda yakin ingin menghapus kategori ini?',
            type: 'danger',
            confirmText: 'Hapus'
        });
        
        if (confirmed) {
            try {
                const result = await deleteCategory(id);
                if (!result.success) {
                    showAlert({ title: 'Gagal', message: result.error || 'Gagal menghapus kategori', type: 'error' });
                } else {
                    showAlert({ title: 'Berhasil', message: 'Kategori berhasil dihapus', type: 'success' });
                }
            } catch (error: any) {
                const { title, message } = translateError(error);
                showAlert({ title, message, type: 'error' });
            }
        }
    };

    return (
        <div>
            {/* Add Category Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
                    Tambah Kategori Baru
                </h2>
                <form action={async (formData) => {
                    setIsSubmitting(true);
                    try {
                        const name = formData.get('name') as string;
                        await createCategory({ name });
                        const form = document.getElementById('add-category-form') as HTMLFormElement;
                        form?.reset();
                        showAlert({ title: 'Berhasil', message: 'Kategori berhasil ditambahkan', type: 'success' });
                    } catch (error: any) {
                        const { title, message } = translateError(error);
                        showAlert({ title, message, type: 'error' });
                    } finally {
                        setIsSubmitting(false);
                    }
                }} id="add-category-form" className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                        <input name="name" required placeholder="Contoh: Laptop, Proyektor, Kabel" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#0F4C81] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0F4C81]/90 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </form>
            </div>

            {/* Categories List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {categories.map((category) => (
                        <div key={category.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                            {editingId === category.id ? (
                                /* Edit Mode */
                                <div className="flex items-center gap-3">
                                    <Tags className="w-5 h-5 text-primary shrink-0" />
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        autoFocus
                                    />
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={() => handleSaveEdit(category.id)}
                                            className="px-3 py-1.5 text-xs text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                                        >
                                            Simpan
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* View Mode */
                                <div className="flex items-center gap-3">
                                    <Tags className="w-5 h-5 text-primary shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <span className="font-medium text-gray-900">{category.name}</span>
                                        <span className="text-xs text-gray-400 ml-2">ID: {category.id}</span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => handleEditClick(category)}
                                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <div className="px-6 py-12 text-center">
                            <Tags className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Belum ada kategori. Silahkan tambahkan kategori baru.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
