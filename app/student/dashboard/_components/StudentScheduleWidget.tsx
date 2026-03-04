'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, BookOpen, Calendar as CalendarIcon } from 'lucide-react';

interface ScheduledPracticum {
    id: number;
    courseId: number;
    roomId: number;
    moduleId: number | null;
    createdBy: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    scheduledDate: Date;
    status: 'Aktif' | 'Dibatalkan' | null;
    createdAt: Date | null;
    roomName: string | null;
    courseName: string | null;
    courseCode: string | null;
    moduleName: string | null;
}

interface StudentScheduleWidgetProps {
    schedules: ScheduledPracticum[];
}

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const CAL_HEADERS = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];
const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Helper for JS day (0=Sunday) to our day (0=Monday...6=Sunday)
function jsDayToOurDay(jsDay: number) { return jsDay === 0 ? 6 : jsDay - 1; }
function ourDayToJsDay(ourDay: number) { return ourDay === 6 ? 0 : ourDay + 1; }

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

function toDateKey(d: Date | string) {
    const dt = typeof d === 'string' ? new Date(d) : d;
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

export default function StudentScheduleWidget({ schedules }: StudentScheduleWidgetProps) {
    const now = new Date();
    // Start week offset: 0 means current week
    const [weekOffset, setWeekOffset] = useState(0);

    // Mini Calendar State
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());

    // Calculate the start of the currently viewed week (Monday)
    const currentWeekStart = useMemo(() => {
        const d = new Date(now);
        d.setHours(0, 0, 0, 0);
        // adjust to Monday
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff + (weekOffset * 7));
        return d;
    }, [now, weekOffset]);

    // Calculate dates for the week (Monday to Saturday)
    const weekDates = useMemo(() => {
        const dates: Date[] = [];
        for (let i = 0; i < 6; i++) { // Only Monday (0) to Saturday (5)
            const d = new Date(currentWeekStart);
            d.setDate(d.getDate() + i);
            dates.push(d);
        }
        return dates;
    }, [currentWeekStart]);

    // Fast lookup map for schedules by date string
    const dateMap = useMemo(() => {
        const m = new Map<string, ScheduledPracticum[]>();
        for (const s of schedules) {
            if (s.scheduledDate) {
                const key = toDateKey(s.scheduledDate);
                if (!m.has(key)) m.set(key, []);
                m.get(key)!.push(s);
            }
        }
        // Sort lists inside map by start time
        for (const [key, list] of m.entries()) {
            list.sort((a, b) => a.startTime.localeCompare(b.startTime));
        }
        return m;
    }, [schedules]);

    const getSchedulesForDate = (date: Date) => dateMap.get(toDateKey(date)) || [];

    // Week navigation limits (optional, but good UX to not go infinitely if no schedules)
    const prevWeek = () => setWeekOffset(w => w - 1);
    const nextWeek = () => setWeekOffset(w => w + 1);
    const goCurrentWeek = () => setWeekOffset(0);

    // Mini Calendar Navigation
    const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

    const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);

    // Check if a date falls within the currently selected week (Mon-Sat only)
    const isDateInSelectedWeek = (date: Date) => {
        for (const d of weekDates) {
            if (toDateKey(d) === toDateKey(date)) return true;
        }
        return false;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* MINI CALENDAR (Left - 50%) */}
            <div className="flex flex-col h-auto min-h-[20rem] lg:h-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50">
                        <button onClick={prevMonth} className="p-1 hover:bg-white/70 rounded-md transition-colors">
                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <h2 className="text-sm font-bold text-gray-900">{MONTH_NAMES[month]} {year}</h2>
                        <button onClick={nextMonth} className="p-1 hover:bg-white/70 rounded-md transition-colors">
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>

                    <div className="p-3 flex-1 flex flex-col">
                        <div className="grid grid-cols-7 mb-2">
                            {CAL_HEADERS.map((h, i) => (
                                <div key={i} className="text-center text-[10px] font-bold text-gray-500">{h}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 flex-1">
                            {calendarDays.map((cell, idx) => {
                                const hasSchedule = getSchedulesForDate(cell.date).length > 0;
                                const isToday = toDateKey(cell.date) === toDateKey(now);
                                const inSelectedWeek = isDateInSelectedWeek(cell.date);

                                return (
                                    <div
                                        key={idx}
                                        className={`
                                            flex flex-col items-center justify-center p-1 rounded-md text-xs relative
                                            ${!cell.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                                            ${inSelectedWeek ? 'bg-indigo-50 ring-1 ring-indigo-200 lg:bg-indigo-50 lg:rounded-xl lg:my-1' : ''}
                                            ${isToday ? 'font-bold text-indigo-600' : ''}
                                        `}
                                    >
                                        <span>{cell.date.getDate()}</span>
                                        {hasSchedule && cell.isCurrentMonth && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-0.5" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* WEEKLY SCHEDULE LIST (Right - 50%) */}
            <div className="flex flex-col h-auto min-h-[20rem] lg:h-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
                    <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-white">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <CalendarIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 border-b-0 pb-0">Jadwal Praktikum Mingguan</h2>
                                <p className="text-xs text-gray-500">
                                    {weekDates[0].toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    {' '} - {' '}
                                    {weekDates[5].toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={prevWeek}
                                className="px-2 sm:px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Bebelumnya</span>
                            </button>
                            {weekOffset !== 0 && (
                                <button
                                    onClick={goCurrentWeek}
                                    className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                    Minggu Ini
                                </button>
                            )}
                            <button
                                onClick={nextWeek}
                                className="px-2 sm:px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
                            >
                                <span className="hidden sm:inline">Berikutnya</span> <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="p-5 flex-1 overflow-y-auto">
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#0F4C81] text-white">
                                    <tr>
                                        <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">Hari / Tanggal</th>
                                        <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">Mata Kuliah / Modul</th>
                                        <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">Waktu</th>
                                        <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">Ruangan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {weekDates.map(date => {
                                        const daySchedules = getSchedulesForDate(date);
                                        const isToday = toDateKey(date) === toDateKey(now);
                                        const dayLabel = `${DAY_NAMES[ourDayToJsDay(jsDayToOurDay(date.getDay()))]}, ${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}`;

                                        if (daySchedules.length === 0) {
                                            return (
                                                <tr key={toDateKey(date)} className={`hover:bg-gray-50 transition-colors ${isToday ? 'bg-indigo-50/30' : ''}`}>
                                                    <td className="px-4 py-3 border-r border-gray-100 align-top">
                                                        <div className={`font-medium ${isToday ? 'text-indigo-600' : 'text-gray-900'}`}>{dayLabel}</div>
                                                    </td>
                                                    <td colSpan={3} className="px-4 py-3 text-gray-400 italic text-center">
                                                        Tidak ada jadwal praktikum
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return daySchedules.map((schedule, idx) => (
                                            <tr key={schedule.id} className={`hover:bg-gray-50 transition-colors ${isToday ? 'bg-indigo-50/30' : ''}`}>
                                                {idx === 0 && (
                                                    <td rowSpan={daySchedules.length} className="px-4 py-3 border-r border-gray-100 align-top bg-white">
                                                        <div className={`font-medium ${isToday ? 'text-indigo-600' : 'text-gray-900'}`}>{dayLabel}</div>
                                                    </td>
                                                )}
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold text-gray-900">{schedule.courseName}</div>
                                                    {schedule.moduleName && (
                                                        <div className="text-xs text-indigo-600 mt-0.5">{schedule.moduleName}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                        <span>{schedule.startTime} - {schedule.endTime}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                        <span>{schedule.roomName}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ));
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
