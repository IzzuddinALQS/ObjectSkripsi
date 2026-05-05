'use client';

import { useState, useTransition } from 'react';
import { FileText, Clock, MapPin, BookOpen, CheckCircle, AlertCircle, Plus, ChevronLeft, ChevronRight, Download, Calendar } from 'lucide-react';
import type { ScheduledPracticumWithDetails } from '@/features/scheduled-practicum/types';
import type { PracticumReport } from '@/features/practicum-reports/types';
import { STATUS_COLORS } from '@/features/practicum-reports/types';
import PracticumReportForm from './PracticumReportForm';
import PracticumReportTable from './PracticumReportTable';
import { useRouter } from 'next/navigation';

interface BeritaAcaraManagerProps {
    schedules: ScheduledPracticumWithDetails[];
    myReports: PracticumReport[];
    reportedScheduleIds: number[];
}

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const CAL_HEADERS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const DAY_NAMES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

function getCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    let startPad = firstDay.getDay() - 1;
    if (startPad < 0) startPad = 6;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    for (let i = startPad - 1; i >= 0; i--)
        days.push({ date: new Date(year, month - 1, daysInPrev - i), isCurrentMonth: false });
    for (let d = 1; d <= daysInMonth; d++)
        days.push({ date: new Date(year, month, d), isCurrentMonth: true });
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++)
        days.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });
    return days;
}

function jsDayToOurDay(jsDay: number) { return jsDay === 0 ? 6 : jsDay - 1; }

function toDateKey(d: Date | string) {
    const dt = typeof d === 'string' ? new Date(d) : d;
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

export default function BeritaAcaraManager({ schedules, myReports, reportedScheduleIds }: BeritaAcaraManagerProps) {
    const router = useRouter();
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<ScheduledPracticumWithDetails | null>(null);

    // Download state
    const [downloadPeriod, setDownloadPeriod] = useState<'harian' | 'mingguan' | 'bulanan' | 'custom'>('bulanan');
    const [downloadStartDate, setDownloadStartDate] = useState('');
    const [downloadEndDate, setDownloadEndDate] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const params = new URLSearchParams({ period: downloadPeriod });
            if (downloadPeriod === 'custom') {
                if (!downloadStartDate || !downloadEndDate) {
                    alert('Pilih tanggal mulai dan akhir untuk periode kustom');
                    return;
                }
                params.set('startDate', downloadStartDate);
                params.set('endDate', downloadEndDate);
            } else {
                params.set('date', new Date().toISOString());
            }
            const url = `/api/berita-acara/download?${params.toString()}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Gagal mengunduh');
            const blob = await res.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            const period: Record<string, string> = { harian: 'Harian', mingguan: 'Mingguan', bulanan: 'Bulanan', custom: 'Kustom' };
            a.download = `Berita_Acara_${period[downloadPeriod]}_${new Date().toISOString().slice(0, 10)}.xlsx`;
            a.click();
            URL.revokeObjectURL(a.href);
        } catch {
            alert('Gagal mengunduh file. Silakan coba lagi.');
        } finally {
            setIsDownloading(false);
        }
    };

    const reportedIds = new Set(reportedScheduleIds);

    // Map: dateKey → schedules
    const dateMap = new Map<string, ScheduledPracticumWithDetails[]>();
    for (const s of schedules) {
        if (s.scheduledDate) {
            const key = toDateKey(s.scheduledDate);
            if (!dateMap.has(key)) dateMap.set(key, []);
            dateMap.get(key)!.push(s);
        }
    }

    const calendarDays = getCalendarDays(year, month);

    const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

    const selectedSchedules = selectedDate ? (dateMap.get(toDateKey(selectedDate)) || []) : [];

    const openForm = (schedule: ScheduledPracticumWithDetails) => {
        setSelectedSchedule(schedule);
        setShowForm(true);
    };

    const handleSuccess = () => {
        router.refresh();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Berita Acara Praktikum</h1>
                    <p className="text-gray-500 text-sm mt-1">Isi berita acara untuk jadwal praktikum yang telah berlangsung</p>
                </div>

                {/* Download Panel */}
                <div className="flex flex-col gap-2 bg-white border border-gray-200 rounded-xl p-3 shadow-sm shrink-0">
                    <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">Unduh Riwayat (Excel)</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={downloadPeriod}
                            onChange={e => setDownloadPeriod(e.target.value as any)}
                            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="harian">Harian (hari ini)</option>
                            <option value="mingguan">Mingguan (minggu ini)</option>
                            <option value="bulanan">Bulanan (bulan ini)</option>
                            <option value="custom">Kustom (pilih rentang)</option>
                        </select>
                        {downloadPeriod === 'custom' && (
                            <div className="flex items-center gap-1 flex-wrap">
                                <input
                                    type="date"
                                    value={downloadStartDate}
                                    onChange={e => setDownloadStartDate(e.target.value)}
                                    className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-gray-400">–</span>
                                <input
                                    type="date"
                                    value={downloadEndDate}
                                    onChange={e => setDownloadEndDate(e.target.value)}
                                    className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                        >
                            {isDownloading
                                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <Download className="w-4 h-4" />
                            }
                            {isDownloading ? 'Mengunduh...' : 'Unduh'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                            <button onClick={prevMonth} className="p-1.5 hover:bg-white/70 rounded-lg transition-colors">
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="text-center">
                                <h2 className="text-lg font-bold text-gray-900">{MONTH_NAMES[month]} {year}</h2>
                                <button onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); }} className="text-xs text-blue-600 hover:underline mt-0.5">
                                    Hari Ini
                                </button>
                            </div>
                            <button onClick={nextMonth} className="p-1.5 hover:bg-white/70 rounded-lg transition-colors">
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                            {CAL_HEADERS.map(d => (
                                <div key={d} className="py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7">
                            {calendarDays.map((cell, idx) => {
                                const daySchedules = dateMap.get(toDateKey(cell.date)) || [];
                                const has = daySchedules.length > 0;
                                const today = cell.date.toDateString() === now.toDateString();
                                const selected = selectedDate?.toDateString() === cell.date.toDateString();

                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setSelectedDate(cell.date)}
                                        className={`
                                            relative min-h-[72px] p-1.5 border-b border-r border-gray-100 text-left transition-all duration-150 group
                                            ${!cell.isCurrentMonth ? 'bg-gray-50/60' : ''}
                                            ${selected ? 'ring-2 ring-blue-500 ring-inset z-10' : ''}
                                            ${has && cell.isCurrentMonth ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}
                                        `}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`
                                                inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium
                                                ${today ? 'bg-blue-600 text-white shadow-sm'
                                                    : cell.isCurrentMonth
                                                        ? has ? 'text-blue-800 font-semibold' : 'text-gray-700'
                                                        : 'text-gray-400'
                                                }
                                            `}>
                                                {cell.date.getDate()}
                                            </span>
                                            {has && cell.isCurrentMonth && (
                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                                                    {daySchedules.length}
                                                </span>
                                            )}
                                        </div>
                                        {has && cell.isCurrentMonth && (
                                            <div className="mt-1 space-y-0.5">
                                                {daySchedules.slice(0, 2).map(s => (
                                                    <div key={s.id} className={`text-[10px] leading-tight px-1.5 py-0.5 rounded-sm truncate font-medium ${reportedIds.has(s.id) ? 'bg-green-600/15 text-green-800' : 'bg-blue-600/15 text-blue-800'}`}>
                                                        {s.courseCode}
                                                    </div>
                                                ))}
                                                {daySchedules.length > 2 && (
                                                    <div className="text-[10px] text-blue-600 px-1.5 font-medium">+{daySchedules.length - 2} lagi</div>
                                                )}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-sm bg-blue-50 border border-blue-300" />
                                Ada jadwal
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-sm bg-green-600/15 border border-green-300" />
                                Sudah diisi
                            </span>
                        </div>
                    </div>
                </div>

                {/* Detail Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
                        <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                            {selectedDate ? (
                                <div>
                                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Detail Tanggal</p>
                                    <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                                        {DAY_NAMES[jsDayToOurDay(selectedDate.getDay())]}, {selectedDate.getDate()} {MONTH_NAMES[selectedDate.getMonth()]}
                                    </h3>
                                    <p className="text-xs text-gray-500">{selectedDate.getFullYear()}</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Berita Acara</p>
                                    <p className="text-sm text-gray-500 mt-1">Pilih tanggal untuk melihat jadwal</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4">
                            {selectedDate ? (
                                selectedSchedules.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedSchedules.map(s => {
                                            const alreadyFilled = reportedIds.has(s.id);
                                            return (
                                                <div key={s.id} className={`rounded-lg border p-3 ${alreadyFilled ? 'border-green-100 bg-green-50/50' : 'border-blue-100 bg-blue-50/50'}`}>
                                                    <div className="flex items-start gap-2">
                                                        <div className={`w-1 self-stretch rounded-full shrink-0 mt-0.5 ${alreadyFilled ? 'bg-green-500' : 'bg-blue-500'}`} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-gray-900 text-sm">{s.courseName}</p>
                                                            <p className={`text-xs font-medium ${alreadyFilled ? 'text-green-700' : 'text-blue-700'}`}>{s.courseCode}</p>
                                                            {s.moduleName && (
                                                                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                                                    <BookOpen className="w-3 h-3" />
                                                                    {s.moduleName}
                                                                </p>
                                                            )}
                                                            <div className="flex flex-col gap-1 mt-2 text-xs text-gray-600">
                                                                <span className="inline-flex items-center gap-1">
                                                                    <Clock className={`w-3 h-3 ${alreadyFilled ? 'text-green-600' : 'text-blue-600'}`} />
                                                                    {s.startTime} – {s.endTime}
                                                                </span>
                                                                <span className="inline-flex items-center gap-1">
                                                                    <MapPin className={`w-3 h-3 ${alreadyFilled ? 'text-green-600' : 'text-blue-600'}`} />
                                                                    {s.roomName}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {alreadyFilled ? (
                                                        <div className="mt-3 flex items-center gap-1.5 text-xs text-green-700 font-medium">
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                            Berita acara sudah diisi
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => openForm(s)}
                                                            className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                            Isi Berita Acara
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-500">Tidak ada jadwal di tanggal ini</p>
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                                        <FileText className="w-7 h-7 text-blue-400" />
                                    </div>
                                    <p className="text-sm text-gray-400">Klik tanggal pada kalender</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Riwayat Berita Acara */}
            {myReports.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Riwayat Berita Acara</h2>
                                <p className="text-sm text-gray-500">Berita acara yang telah Anda isi</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        <PracticumReportTable reports={myReports} />
                    </div>
                </div>
            )}

            {/* Form Modal */}
            {showForm && selectedSchedule && (
                <PracticumReportForm
                    isOpen={showForm}
                    onClose={() => { setShowForm(false); setSelectedSchedule(null); }}
                    schedule={selectedSchedule}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
