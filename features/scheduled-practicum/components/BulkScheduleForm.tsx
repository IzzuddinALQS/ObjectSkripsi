'use client';

import { useState, useTransition } from 'react';
import { X, CalendarRange, Loader2 } from 'lucide-react';
import TimeSelect from '@/components/shared/TimeSelect';
import { bulkCreateScheduledPracticum } from '@/features/scheduled-practicum/actions';
import type { CourseWithLecturer } from '@/features/courses/types';
import type { PracticumModuleWithCourse } from '@/features/practicum/types';

interface Room { id: number; name: string; }

interface Props {
    courses: CourseWithLecturer[];
    modules: PracticumModuleWithCourse[];
    rooms: Room[];
    onClose: () => void;
}

const DAY_OPTIONS = [
    { label: 'Senin', value: 0 },
    { label: 'Selasa', value: 1 },
    { label: 'Rabu', value: 2 },
    { label: 'Kamis', value: 3 },
    { label: 'Jumat', value: 4 },
    { label: 'Sabtu', value: 5 },
];

export default function BulkScheduleForm({ courses, modules, rooms, onClose }: Props) {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [selectedModuleId, setSelectedModuleId] = useState('');
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('10:00');
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
    const [periodStart, setPeriodStart] = useState('');
    const [periodEnd, setPeriodEnd] = useState('');

    const filteredModules = selectedCourseId
        ? modules.filter((m) => m.courseId === parseInt(selectedCourseId))
        : modules;

    const toggleDay = (day: number) => {
        setDaysOfWeek((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (daysOfWeek.length === 0) {
            setResult({ type: 'error', text: 'Pilih minimal satu hari' });
            return;
        }
        setResult(null);
        startTransition(async () => {
            const res = await bulkCreateScheduledPracticum({
                courseId: parseInt(selectedCourseId),
                roomId: parseInt(selectedRoomId),
                moduleId: selectedModuleId ? parseInt(selectedModuleId) : undefined,
                startTime,
                endTime,
                daysOfWeek,
                periodStart,
                periodEnd,
            });
            if (res.success) {
                setResult({
                    type: 'success',
                    text: `Berhasil membuat ${res.created} jadwal${res.skipped ? `, ${res.skipped} dilewati karena bentrok` : ''}.`,
                });
            } else {
                setResult({ type: 'error', text: res.error || 'Gagal membuat jadwal' });
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b">
                    <div className="flex items-center gap-2 font-semibold text-gray-800">
                        <CalendarRange className="w-5 h-5 text-green-600" />
                        Buat Jadwal Massal
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Mata Kuliah */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mata Kuliah *</label>
                        <select
                            required
                            value={selectedCourseId}
                            onChange={(e) => { setSelectedCourseId(e.target.value); setSelectedModuleId(''); }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Pilih mata kuliah</option>
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>{c.code} – {c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Ruangan */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ruangan *</label>
                        <select
                            required
                            value={selectedRoomId}
                            onChange={(e) => setSelectedRoomId(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Pilih ruangan</option>
                            {rooms.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Modul (opsional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Modul Praktikum <span className="text-gray-400">(opsional)</span></label>
                        <select
                            value={selectedModuleId}
                            onChange={(e) => setSelectedModuleId(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Tanpa modul</option>
                            {filteredModules.map((m) => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Jam */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai *</label>
                            <TimeSelect value={startTime} onChange={setStartTime} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai *</label>
                            <TimeSelect value={endTime} onChange={setEndTime} />
                        </div>
                    </div>

                    {/* Hari */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hari Praktikum *</label>
                        <div className="flex flex-wrap gap-2">
                            {DAY_OPTIONS.map((d) => (
                                <button
                                    type="button"
                                    key={d.value}
                                    onClick={() => toggleDay(d.value)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                                        daysOfWeek.includes(d.value)
                                            ? 'bg-green-600 text-white border-green-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                                    }`}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Periode */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai *</label>
                            <input
                                type="date"
                                required
                                value={periodStart}
                                onChange={(e) => setPeriodStart(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai *</label>
                            <input
                                type="date"
                                required
                                value={periodEnd}
                                onChange={(e) => setPeriodEnd(e.target.value)}
                                min={periodStart}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        Sistem akan membuat jadwal untuk setiap hari yang dipilih dalam rentang tanggal tersebut. Jadwal yang bentrok akan dilewati otomatis.
                    </p>

                    {result && (
                        <div className={`p-3 rounded-lg text-sm ${result.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {result.text}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</> : 'Buat Jadwal Massal'}
                        </button>
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                            {result?.type === 'success' ? 'Tutup' : 'Batal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
