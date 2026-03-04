'use client';

import { useState, useMemo } from 'react';
import { CalendarDays, Filter, ChevronDown, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';

interface Booking {
    id: number;
    startTime: Date;
    endTime: Date;
    purpose: string;
    room: {
        id: number;
        name: string;
    };
}

interface PracticumSchedule {
    id: number;
    roomId: number;
    roomName: string | null;
    courseName: string | null;
    courseCode: string | null;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    scheduledDate: Date;
}

interface Room {
    id: number;
    name: string;
    location: string;
}

interface HomeCalendarProps {
    rooms: Room[];
    bookings: Booking[];
    practicumSchedules?: PracticumSchedule[];
    title?: string;
    className?: string;
}

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function HomeCalendar({
    rooms,
    bookings,
    practicumSchedules = [],
    title = "Jadwal Pemakaian Ruangan",
    className = ""
}: HomeCalendarProps) {
    const [selectedRoomId, setSelectedRoomId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Filter bookings based on selected room
    const filteredBookings = useMemo(() => {
        return bookings.filter(b => {
            if (selectedRoomId) {
                return b.room.id.toString() === selectedRoomId;
            }
            return true;
        });
    }, [bookings, selectedRoomId]);

    // Filter practicum schedules by room
    const filteredPracticums = useMemo(() => {
        return practicumSchedules.filter(p => {
            if (selectedRoomId) {
                return p.roomId.toString() === selectedRoomId;
            }
            return true;
        });
    }, [practicumSchedules, selectedRoomId]);

    // Get days in month
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        let startDay = firstDay.getDay() - 1;
        if (startDay < 0) startDay = 6;

        return { daysInMonth, startDay };
    };

    // Check if date has bookings or practicums
    const hasBooking = (day: number) => {
        const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const hasRegularBooking = filteredBookings.some(b => {
            const bookingDate = new Date(b.startTime);
            return bookingDate.getDate() === checkDate.getDate() &&
                bookingDate.getMonth() === checkDate.getMonth() &&
                bookingDate.getFullYear() === checkDate.getFullYear();
        });
        if (hasRegularBooking) return true;

        return filteredPracticums.some(p => {
            const pDate = new Date(p.scheduledDate);
            return pDate.getDate() === checkDate.getDate() &&
                pDate.getMonth() === checkDate.getMonth() &&
                pDate.getFullYear() === checkDate.getFullYear();
        });
    };

    // Get bookings for selected date
    const getBookingsForDay = (date: Date) => {
        return filteredBookings.filter(b => {
            const bookingDate = new Date(b.startTime);
            return bookingDate.getDate() === date.getDate() &&
                bookingDate.getMonth() === date.getMonth() &&
                bookingDate.getFullYear() === date.getFullYear();
        });
    };

    // Get practicum schedules for selected date
    const getPracticumsForDay = (date: Date) => {
        return filteredPracticums.filter(p => {
            const pDate = new Date(p.scheduledDate);
            return pDate.getDate() === date.getDate() &&
                pDate.getMonth() === date.getMonth() &&
                pDate.getFullYear() === date.getFullYear();
        });
    };

    // Check if day is today
    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();
    };

    // Check if day is selected
    const isSelected = (day: number) => {
        if (!selectedDate) return false;
        return day === selectedDate.getDate() &&
            currentDate.getMonth() === selectedDate.getMonth() &&
            currentDate.getFullYear() === selectedDate.getFullYear();
    };

    // Handle date click
    const handleDateClick = (day: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(newDate);
    };

    // Navigation
    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const { daysInMonth, startDay } = getDaysInMonth(currentDate);
    const selectedDayBookings = selectedDate ? getBookingsForDay(selectedDate) : [];
    const selectedDayPracticums = selectedDate ? getPracticumsForDay(selectedDate) : [];
    const hasAnyEvents = selectedDayBookings.length > 0 || selectedDayPracticums.length > 0;

    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#0F4C81]/10 rounded-lg text-[#0F4C81]">
                        <CalendarDays className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0F4C81]">
                        {title}
                    </h3>
                </div>

                {/* Filter */}
                <div className="relative group min-w-0 w-full sm:min-w-[180px] sm:w-auto">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <Filter className="w-4 h-4" />
                    </div>
                    <select
                        value={selectedRoomId}
                        onChange={(e) => setSelectedRoomId(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 text-[#1F2937] text-sm bg-gray-50 hover:bg-white hover:border-[#0F4C81] focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 appearance-none cursor-pointer transition-all outline-none"
                    >
                        <option value="">Semua Ruangan</option>
                        {rooms.map(room => (
                            <option key={room.id} value={room.id}>{room.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="p-4">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={prevMonth}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h3 className="text-sm font-semibold text-gray-800">
                        {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    <button
                        onClick={nextMonth}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS.map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells */}
                    {Array.from({ length: startDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {/* Day cells */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const hasBookingToday = hasBooking(day);
                        const isTodayDate = isToday(day);
                        const isSelectedDate = isSelected(day);

                        return (
                            <button
                                key={day}
                                onClick={() => handleDateClick(day)}
                                className={`
                                    aspect-square flex items-center justify-center text-sm rounded-lg transition-all relative
                                    ${isSelectedDate
                                        ? 'bg-[#0F4C81] text-white font-semibold shadow-md'
                                        : isTodayDate
                                            ? 'bg-[#0F4C81]/10 text-[#0F4C81] font-semibold'
                                            : 'hover:bg-gray-100 text-gray-700'
                                    }
                                `}
                            >
                                {day}
                                {hasBookingToday && !isSelectedDate && (
                                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0F4C81] rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Events List Below Calendar */}
            {selectedDate && hasAnyEvents && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-4 animate-in slide-in-from-top-2">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3 text-sm">
                        <CalendarDays className="w-4 h-4 text-[#0F4C81]" />
                        {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h4>
                    <div className="space-y-2">
                        {/* Practicum schedules first */}
                        {selectedDayPracticums.map(practicum => (
                            <div key={`p-${practicum.id}`} className="bg-green-50 p-3 rounded-lg border border-green-200 shadow-sm">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-2 text-sm font-bold text-green-800">
                                        <Clock className="w-3.5 h-3.5 text-green-600" />
                                        {practicum.startTime}
                                        <span className="text-green-400">-</span>
                                        {practicum.endTime}
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-xs font-medium text-green-700 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {practicum.roomName}
                                    </span>
                                </div>
                                <p className="text-sm text-green-800 font-semibold pl-5">
                                    🎓 Praktikum: {practicum.courseName} ({practicum.courseCode})
                                </p>
                                <p className="text-xs text-green-600 pl-5 mt-0.5">Ruangan tidak tersedia untuk booking</p>
                            </div>
                        ))}

                        {/* Regular bookings */}
                        {selectedDayBookings.map(booking => (
                            <div key={booking.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                        <Clock className="w-3.5 h-3.5 text-[#0F4C81]" />
                                        {new Date(booking.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        <span className="text-gray-400">-</span>
                                        {new Date(booking.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {booking.room.name}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 pl-5">
                                    {booking.purpose}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
