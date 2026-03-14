'use client';

import { useState } from 'react';
import { Download, Users, Package, Calendar, Loader2 } from 'lucide-react';
import { exportAttendanceData, exportLoanData, exportBookingData } from '@/features/governance/export-actions';

export default function DataExport() {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [startDate, setStartDate] = useState(() => {
        // Default: first day of current month
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    });
    const [endDate, setEndDate] = useState(() => {
        // Default: today
        return new Date().toISOString().split('T')[0];
    });
    const [result, setResult] = useState<{ type: string; count: number } | null>(null);

    const downloadCSV = (csv: string, filename: string) => {
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExport = async (type: 'attendance' | 'loans' | 'bookings') => {
        setIsLoading(type);
        setResult(null);

        try {
            const filters = { startDate, endDate };
            let data;
            let filename;

            switch (type) {
                case 'attendance':
                    data = await exportAttendanceData(filters);
                    filename = `kehadiran_${startDate}_${endDate}.csv`;
                    break;
                case 'loans':
                    data = await exportLoanData(filters);
                    filename = `peminjaman_${startDate}_${endDate}.csv`;
                    break;
                case 'bookings':
                    data = await exportBookingData(filters);
                    filename = `booking_ruangan_${startDate}_${endDate}.csv`;
                    break;
            }

            if (data.count > 0) {
                downloadCSV(data.csv, filename);
                setResult({ type, count: data.count });
            } else {
                setResult({ type, count: 0 });
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Gagal mengekspor data');
        } finally {
            setIsLoading(null);
        }
    };

    const exportItems = [
        {
            id: 'attendance',
            title: 'Data Kehadiran',
            description: 'Export data presensi/absensi pengguna laboratorium',
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            id: 'loans',
            title: 'Data Peminjaman Alat',
            description: 'Export data peminjaman alat dan inventaris',
            icon: Package,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            id: 'bookings',
            title: 'Data Booking Ruangan',
            description: 'Export data reservasi ruangan laboratorium',
            icon: Calendar,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
    ];

    return (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Export Laporan
            </h2>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-3">Filter Periode</p>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Dari:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Sampai:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>
            </div>

            {result && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${result.count > 0 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    {result.count > 0
                        ? `✅ Berhasil mengekspor ${result.count} data ${result.type === 'attendance' ? 'kehadiran' : result.type === 'loans' ? 'peminjaman' : 'booking'}`
                        : `⚠️ Tidak ada data ${result.type === 'attendance' ? 'kehadiran' : result.type === 'loans' ? 'peminjaman' : 'booking'} pada periode yang dipilih`
                    }
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {exportItems.map((item) => (
                    <div
                        key={item.id}
                        className={`p-4 rounded-xl border border-gray-100 ${item.bgColor} hover:shadow-md transition-shadow`}
                    >
                        <div className="flex items-start gap-3 mb-3">
                            <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{item.title}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleExport(item.id as 'attendance' | 'loans' | 'bookings')}
                            disabled={isLoading !== null}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isLoading === item.id
                                    ? 'bg-gray-300 text-gray-500'
                                    : 'bg-[#0F4C81] text-white hover:bg-[#0F4C81]/90'
                                } disabled:opacity-50`}
                        >
                            {isLoading === item.id ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Mengekspor...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Download CSV
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
