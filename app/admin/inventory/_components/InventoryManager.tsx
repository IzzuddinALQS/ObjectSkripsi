'use client';

import { useState } from 'react';
import { Box, MapPin } from 'lucide-react';
import RoomsView from './RoomsView';
import ItemsView from './ItemsView';

interface InventoryManagerProps {
    categories: any[];
    rooms: any[];
    items: any[];
}

export default function InventoryManager({ categories, rooms, items }: InventoryManagerProps) {
    const [activeTab, setActiveTab] = useState<'items' | 'rooms'>('items');

    return (
        <div className="min-w-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Manajemen Aset</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola inventaris alat, kategori, dan ruangan laboratorium</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6 w-full max-w-full overflow-x-auto scrollbar-hide">
                <button
                    onClick={() => setActiveTab('items')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'items'
                        ? 'bg-white text-[#0F4C81] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                >
                    <Box className="w-4 h-4" />
                    Daftar Alat
                </button>
                <button
                    onClick={() => setActiveTab('rooms')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'rooms'
                        ? 'bg-white text-[#0F4C81] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                >
                    <MapPin className="w-4 h-4" />
                    Ruangan
                </button>
            </div>

            {/* Content */}
            <div>
                {activeTab === 'items' && <ItemsView items={items} rooms={rooms} categories={categories} />}
                {activeTab === 'rooms' && <RoomsView rooms={rooms} />}
            </div>
        </div>
    );
}
