'use client';

import { createUser, updateUser } from '@/features/users/actions';
import { useState, useMemo } from 'react';
import { UserPlus, Save, Loader2 } from 'lucide-react';

interface Role {
    id: number;
    name: string;
}

interface Lecturer {
    identifier: string;
    fullName: string;
}

interface UserFormProps {
    roles: Role[];
    lecturers: Lecturer[];
    initialData?: any;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function UserForm({ roles, lecturers, initialData, onSuccess, onCancel }: UserFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>(initialData?.roleId);

    // Derived state for role checking
    const isStudent = useMemo(() => {
        if (!selectedRoleId) return false;
        const selectedRole = roles.find(r => r.id === selectedRoleId);
        return selectedRole?.name === 'Mahasiswa';
    }, [selectedRoleId, roles]);

    const isEdit = !!initialData;

    return (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {isEdit ? <Save className="w-5 h-5 text-primary" /> : <UserPlus className="w-5 h-5 text-primary" />}
                {isEdit ? 'Edit User' : 'Tambah User Baru'}
            </h2>
            <form action={async (formData) => {
                setIsSubmitting(true);
                try {
                    const data: any = {
                        fullName: formData.get('fullName') as string,
                        identifier: formData.get('identifier') as string,
                        email: formData.get('email') as string,
                        roleId: parseInt(formData.get('roleId') as string),
                        passwordHash: formData.get('password') as string || undefined,
                    };

                    // Append student specific data
                    if (isStudent) {
                        const batch = formData.get('batch');
                        const studyType = formData.get('studyType');
                        const programStudi = formData.get('programStudi');
                        const dosenPembimbing = formData.get('dosenPembimbing');

                        // We enforce validation here as well
                        if (!batch || !studyType) {
                            throw new Error('Angkatan dan Tipe Belajar wajib diisi untuk Mahasiswa');
                        }

                        data.batch = parseInt(batch as string);
                        data.studyType = studyType as 'Reguler' | 'Hybrid';
                        data.programStudi = (programStudi as string) || 'Informatika';
                        data.dosenPembimbing = dosenPembimbing as string || undefined;
                    }

                    if (isEdit) {
                        await updateUser(initialData.identifier, data);
                    } else {
                        if (!data.passwordHash) throw new Error('Password wajib diisi untuk user baru');
                        await createUser(data);
                    }

                    if (onSuccess) onSuccess();
                    if (!isEdit) {
                        const form = document.getElementById('user-form') as HTMLFormElement;
                        form?.reset();
                        setSelectedRoleId(undefined);
                    }
                } catch (error: any) {
                    alert(error.message || 'Gagal menyimpan user');
                } finally {
                    setIsSubmitting(false);
                }
            }} id="user-form" className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                    <input
                        name="fullName"
                        defaultValue={initialData?.fullName}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Contoh: Budi Santoso"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIM / NIDN</label>
                    <input
                        name="identifier"
                        defaultValue={initialData?.identifier}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Contoh: 0102521001"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        name="email"
                        type="email"
                        defaultValue={initialData?.email}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="nama@uai.ac.id"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                        name="roleId"
                        value={selectedRoleId || ''}
                        onChange={(e) => setSelectedRoleId(parseInt(e.target.value))}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    >
                        <option value="">Pilih Role</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>
                </div>

                {isStudent && (
                    <>
                        <div className="animate-in fade-in duration-300">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Angkatan <span className="text-red-500">*</span></label>
                            <select
                                name="batch"
                                defaultValue={initialData?.batch || new Date().getFullYear()}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                            >
                                <option value="">Pilih Tahun</option>
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div className="animate-in fade-in duration-300">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Belajar <span className="text-red-500">*</span></label>
                            <select
                                name="studyType"
                                defaultValue={initialData?.studyType || 'Reguler'}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                            >
                                <option value="">Pilih Tipe</option>
                                <option value="Reguler">Reguler</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div className="animate-in fade-in duration-300">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
                            <input
                                name="programStudi"
                                defaultValue={initialData?.programStudi || 'Informatika'}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Contoh: Informatika"
                            />
                        </div>
                        <div className="animate-in fade-in duration-300">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dosen Pembimbing <span className="text-red-500">*</span></label>
                            <select
                                name="dosenPembimbing"
                                defaultValue={initialData?.dosenPembimbing || ''}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                            >
                                <option value="">Pilih Dosen Pembimbing</option>
                                {lecturers.map(lecturer => (
                                    <option key={lecturer.identifier} value={lecturer.fullName}>
                                        {lecturer.fullName} ({lecturer.identifier})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isEdit ? 'Password (Kosongkan jika tidak ingin mengubah)' : 'Password'} <span className="text-xs text-gray-400 font-normal">Min. 6 karakter</span>
                    </label>
                    <input
                        name="password"
                        type="password"
                        required={!isEdit}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder={isEdit ? '********' : 'Masukan password...'}
                    />
                </div>

                <div className="md:col-span-2 flex gap-2 pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#0F4C81] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#0F4C81]/90 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            'Simpan User'
                        )}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-200"
                        >
                            Batal
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
