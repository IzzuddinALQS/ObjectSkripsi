'use client';

import { useState, useMemo } from 'react';
import { Box, ClipboardList, Search, LayoutGrid, List as ListIcon, MapPin, Tag } from 'lucide-react';
import ItemCard from './ItemCard';
import LoansTable from '../../loans/_components/LoansTable';

interface StudentItemsManagerProps {
    items: any[];
    categories: any[];
    rooms: any[];
    myLoans: any[];
    userId: string;
    initialTab?: 'items' | 'loans';
    initialQrCode?: string;
    initialAction?: string;
    role?: 'student' | 'lecturer';
}

export default function StudentItemsManager({
    items,
    categories,
    rooms,
    myLoans,
    userId,
    initialTab = 'items',
    initialQrCode,
    initialAction,
    role = 'student'
}: StudentItemsManagerProps) {
    const [activeTab, setActiveTab] = useState<'items' | 'loans'>(initialTab);

    // Items list state
    const [searchQuery, setSearchQuery] = useState(initialQrCode || '');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Filter items
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!item.name.toLowerCase().includes(query) && !item.qrCode?.toLowerCase().includes(query)) return false;
            }
            if (selectedCategory && item.categoryId !== parseInt(selectedCategory)) {
                return false;
            }
            if (selectedRoom && item.roomId !== parseInt(selectedRoom)) {
                return false;
            }
            return true;
        });
    }, [items, searchQuery, selectedCategory, selectedRoom]);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Peminjaman Alat</h1>
                <p className="text-gray-500 text-sm mt-1">Pinjam alat dan pantau status peminjaman Anda</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
                <button
                    onClick={() => setActiveTab('items')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'items'
                        ? 'bg-white text-[#0F4C81] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                >
                    <Box className="w-4 h-4" />
                    Pinjam Alat
                </button>
                <button
                    onClick={() => setActiveTab('loans')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'loans'
                        ? 'bg-white text-[#0F4C81] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                >
                    <ClipboardList className="w-4 h-4" />
                    Peminjaman Saya
                    {myLoans.filter(l => l.status === 'Pending').length > 0 && (
                        <span className="ml-1.5 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                            {myLoans.filter(l => l.status === 'Pending').length}
                        </span>
                    )}
                </button>
            </div>

            {/* Content */}
            <div>
                {activeTab === 'items' && (
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari nama alat..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-0 w-full sm:min-w-[9.375rem] sm:w-auto"
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedRoom}
                                    onChange={(e) => setSelectedRoom(e.target.value)}
                                    className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-0 w-full sm:min-w-[9.375rem] sm:w-auto"
                                >
                                    <option value="">Semua Ruangan</option>
                                    {rooms.map(room => (
                                        <option key={room.id} value={room.id}>{room.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Menampilkan {filteredItems.length} dari {items.length} alat
                            </p>
                            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#0F4C81]' : 'text-gray-500 hover:text-gray-700'}`} title="Tampilan Grid">
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-[#0F4C81]' : 'text-gray-500 hover:text-gray-700'}`} title="Tampilan List">
                                    <ListIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Items Display */}
                        {filteredItems.length === 0 ? (
                            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                                <Box className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">
                                    {searchQuery || selectedCategory || selectedRoom
                                        ? 'Tidak ada alat yang sesuai dengan filter.'
                                        : 'Tidak ada alat tersedia saat ini.'}
                                </p>
                            </div>
                        ) : viewMode === 'list' ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                                                <th className="px-6 py-3 font-medium">Nama Alat</th>
                                                <th className="px-4 py-3 font-medium">Kategori</th>
                                                <th className="px-4 py-3 font-medium">Ruangan</th>
                                                <th className="px-4 py-3 font-medium text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredItems.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                                <Box className="w-5 h-5 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                                {item.description && (
                                                                    <p className="text-xs text-gray-500 line-clamp-1 max-w-xs">{item.description}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="inline-flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                            <Tag className="w-3 h-3 text-gray-400" />
                                                            {item.category.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                                                            <MapPin className="w-3 h-3 text-gray-400" />
                                                            {item.room.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <ItemCard
                                                            item={item}
                                                            userId={userId}
                                                            variant="list"
                                                            role={role}
                                                            initialOpen={initialQrCode === item.qrCode && initialAction === 'pinjam'}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredItems.map(item => (
                                    <ItemCard
                                        key={item.id}
                                        item={item}
                                        userId={userId}
                                        variant="grid"
                                        role={role}
                                        initialOpen={initialQrCode === item.qrCode && initialAction === 'pinjam'}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'loans' && (
                    <div className="space-y-4">
                        <LoansTable loans={myLoans as any} />
                    </div>
                )}
            </div>
        </div>
    );
}
