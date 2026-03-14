'use client';

import { useEffect, useState } from 'react';
import { getTodayAttendanceAction } from '@/features/attendance/actions';
import { formatTimeWIB } from '@/lib/timezone';
import { Users, MapPin, Clock } from 'lucide-react';

interface AttendanceRecord {
    id: number;
    purpose: string;
    checkInTime: Date | null;
    dosenPenanggungJawab: string | null;
    user: {
        id: number;
        fullName: string;
        identifier: string;
    };
    room: {
        id: number;
        name: string;
    };
}

export default function TodayAttendance() {
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAttendance() {
            try {
                const data = await getTodayAttendanceAction();
                setAttendance(data as AttendanceRecord[]);
            } catch (error) {
                console.error('Failed to fetch attendance:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchAttendance();
    }, []);

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="animate-pulse">
                    <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-16 bg-gray-100 rounded"></div>
                        <div className="h-16 bg-gray-100 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[#0F4C81]" />
                <h2 className="text-lg font-semibold text-gray-800">Kehadiran Lab Hari Ini</h2>
                <span className="bg-[#0F4C81] text-white text-xs px-2 py-0.5 rounded-full">{attendance.length}</span>
            </div>

            {attendance.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Belum ada kehadiran hari ini</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {attendance.map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#0F4C81]/10 flex items-center justify-center">
                                    <span className="text-[#0F4C81] font-semibold text-sm">
                                        {record.user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{record.user.fullName}</p>
                                    <p className="text-xs text-gray-500">{record.user.identifier}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-xs text-[#0F4C81] font-medium">
                                    <MapPin className="w-3 h-3" />
                                    {record.room.name}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTimeWIB(record.checkInTime)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
