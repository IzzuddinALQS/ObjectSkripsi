'use client';

import { useState } from 'react';
import { UserCheck } from 'lucide-react';
import AttendanceModal from './AttendanceModal';

interface AttendanceButtonProps {
    userData?: {
        identifier: string;
        role: string;
        dosenPembimbing?: string;
    };
}

export default function AttendanceButton({ userData }: AttendanceButtonProps = {}) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 sm:px-4 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md"
            >
                <UserCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Absen Masuk</span>
            </button>

            <AttendanceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userData={userData}
            />
        </>
    );
}
