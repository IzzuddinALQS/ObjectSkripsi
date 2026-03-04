'use client';

import { createRoom, deleteRoom, updateRoom } from '@/features/inventory/actions';
import { Plus, Trash2, MapPin, Edit, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import Modal from '@/components/shared/Modal';

interface Room {
    id: number;
    name: string;
    location: string;
    capacity: number;
    status: 'Tersedia' | 'Maintenance' | null;
}

interface RoomsViewProps {
    rooms: Room[];
}

export default function RoomsView({ rooms }: RoomsViewProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Get unique locations for filter
    const allLocations = useMemo(() => {
        const locationSet = new Set<string>();
        rooms.forEach(room => {
            if (room.location) locationSet.add(room.location);
        });
        return Array.from(locationSet).sort();
    }, [rooms]);

    // Filtered rooms
    const filteredRooms = useMemo(() => {
        return rooms.filter(room => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!room.name.toLowerCase().includes(query) &&
                    !room.location.toLowerCase().includes(query)) {
                    return false;
                }
            }
            // Status filter
            if (filterStatus && room.status !== filterStatus) {
                return false;
            }
            return true;
        });
    }, [rooms, searchQuery, filterStatus]);

    const handleEdit = async (formData: FormData) => {
        if (!editingRoom) return;
        setIsSubmitting(true);
        const name = formData.get('name') as string;
        const location = formData.get('location') as string;
        const capacity = parseInt(formData.get('capacity') as string);

        await updateRoom(editingRoom.id, { name, location, capacity });
        setIsSubmitting(false);
        setEditingRoom(null);
    };

    return (
        <div className="space-y-6">
            {/* Add Room Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
                    Tambah Ruangan Baru
                </h2>
                <form action={async (formData) => {
                    setIsSubmitting(true);
                    const name = formData.get('name') as string;
                    const location = formData.get('location') as string;
                    const capacity = parseInt(formData.get('capacity') as string);

                    await createRoom({ name, location, capacity });
                    setIsSubmitting(false);
                    const form = document.getElementById('add-room-form') as HTMLFormElement;
                    form?.reset();
                }} id="add-room-form" className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ruangan</label>
                        <input name="name" required placeholder="Contoh: Lab RPL" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                        <input name="location" required placeholder="Lantai 3" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="w-full md:w-32">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas</label>
                        <input name="capacity" type="number" required placeholder="40" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#0F4C81] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0F4C81]/90 transition-colors disabled:opacity-50 w-full md:w-auto"
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </form>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-3">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama ruangan atau lokasi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                        />
                    </div>
                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="">Semua Status</option>
                        <option value="Tersedia">Tersedia</option>
                        <option value="Maintenance">Maintenance</option>
                    </select>
                </div>
                <p className="text-xs text-gray-500 mt-2">Menampilkan {filteredRooms.length} dari {rooms.length} ruangan</p>
            </div>

            {/* Rooms List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Nama Ruangan</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Lokasi</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Kapasitas</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRooms.map((room) => (
                                <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{room.name}</td>
                                    <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        {room.location}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{room.capacity} Orang</td>
                                    <td className="px-6 py-4">
                                        <select
                                            defaultValue={room.status || 'Tersedia'}
                                            onChange={async (e) => {
                                                const { updateRoomStatus } = await import('@/features/inventory/actions');
                                                await updateRoomStatus(
                                                    room.id,
                                                    e.target.value as 'Tersedia' | 'Maintenance'
                                                );
                                            }}
                                            className={`text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer ${room.status === 'Tersedia' ? 'bg-green-50 text-green-700' :
                                                'bg-gray-50 text-gray-700'
                                                }`}
                                        >
                                            <option value="Tersedia">Tersedia</option>
                                            <option value="Maintenance">Maintenance</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1 justify-center">
                                            <button
                                                onClick={() => setEditingRoom(room)}
                                                className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <form action={async () => {
                                                if (confirm('Apakah Anda yakin ingin menghapus ruangan ini?')) {
                                                    await deleteRoom(room.id);
                                                }
                                            }}>
                                                <button
                                                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRooms.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        {rooms.length === 0
                                            ? 'Belum ada data ruangan. Silahkan tambahkan ruangan baru.'
                                            : 'Tidak ada ruangan yang sesuai filter.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Room Modal */}
            <Modal
                isOpen={!!editingRoom}
                onClose={() => setEditingRoom(null)}
                title="Edit Ruangan"
            >
                {editingRoom && (
                    <form action={handleEdit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ruangan</label>
                            <input
                                name="name"
                                required
                                defaultValue={editingRoom.name}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                            <input
                                name="location"
                                required
                                defaultValue={editingRoom.location}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas</label>
                            <input
                                name="capacity"
                                type="number"
                                required
                                defaultValue={editingRoom.capacity}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="flex gap-3 justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => setEditingRoom(null)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#0F4C81] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0F4C81]/90 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
