'use client';

import { useState, useMemo, useTransition } from 'react';
import { User, CheckCircle, XCircle, Search, X } from 'lucide-react';
import { updateUserStatus } from '@/features/users/actions';

interface PendingUser {
    id: number;
    fullName: string;
    identifier: string;
    email: string | null;
    roleName: string;
}

interface SearchableUsersProps {
    users: PendingUser[];
}

export default function SearchableUsersSection({ users }: SearchableUsersProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isPending, startTransition] = useTransition();

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users;
        const query = searchQuery.toLowerCase();
        return users.filter(user =>
            user.fullName.toLowerCase().includes(query) ||
            user.identifier.toLowerCase().includes(query) ||
            (user.email && user.email.toLowerCase().includes(query))
        );
    }, [users, searchQuery]);

    const handleApprove = (userId: string) => {
        startTransition(async () => {
            await updateUserStatus(userId, 'Active');
        });
    };

    const handleReject = (userId: string) => {
        startTransition(async () => {
            await updateUserStatus(userId, 'Rejected');
        });
    };

    return (
        <div>
            {/* Stats */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                <h3 className="text-gray-500 text-sm font-medium">Menunggu Persetujuan</h3>
                <p className="text-3xl font-bold text-orange-500 mt-2">{users.length}</p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama, NIM/NIDN, atau email..."
                        className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81]"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <p className="text-sm text-gray-500 mt-2">
                        Menampilkan {filteredUsers.length} dari {users.length} user
                    </p>
                )}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Nama</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">NIM/NIDN</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Email</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Role</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.identifier} className={`hover:bg-gray-50 transition-colors ${isPending ? 'opacity-50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <p className="font-medium text-gray-900">{user.fullName}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{user.identifier}</td>
                                    <td className="px-6 py-4 text-gray-600">{user.email || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                                            {user.roleName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => handleApprove(user.identifier)}
                                                disabled={isPending}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Setujui
                                            </button>
                                            <button
                                                onClick={() => handleReject(user.identifier)}
                                                disabled={isPending}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Tolak
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        {searchQuery ? 'Tidak ada hasil pencarian' : 'Tidak ada permintaan registrasi.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
