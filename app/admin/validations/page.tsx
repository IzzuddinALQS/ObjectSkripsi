import { getLoanRequests, updateLoanStatus, deleteLoan, getPendingReturns, approveReturn, rejectReturn, adminDirectReturn } from '@/features/loans/actions';
import { getBookingRequests, updateBookingStatus, getAllRooms, getMonthBookings, deleteBooking, getScheduledPracticumsForCalendar } from '@/features/bookings/actions';
import { getPendingUsers, getRejectedUsers, updateUserStatus } from '@/features/users/actions';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Box, User, CheckCircle, XCircle, MapPin, Trash2, MessageSquare } from 'lucide-react';
import CalendarView from '@/components/shared/CalendarView';
import ValidationTabs from './_components/ValidationTabs';
import PendingReturnsList from './_components/PendingReturnsList';
import SearchableRiwayatSection from './_components/SearchableRiwayatSection';

import LoanHistoryFilter from './_components/LoanHistoryFilter';
import { getAvailableItems } from '@/features/inventory/actions';
import { getLecturersForLoan } from '@/features/loans/actions';
import ManualLoanButton from './_components/ManualLoanButton';
import ManualBookingButton from './_components/ManualBookingButton';
import ActiveLoansTable from './_components/ActiveLoansTable';
import ActiveBookingsTable from './_components/ActiveBookingsTable';

export default async function AdminValidationsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const session = await getSession();
    if (!session) redirect('/login');

    const params = await searchParams;

    // --- Data Fetching for Loans ---
    const loans = await getLoanRequests();
    const pendingLoans = loans.filter(l => l.status === 'Pending');

    // --- Data Fetching for Bookings ---
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const [bookings, rooms, currentMonthBookings, nextMonthBookings, nextNextMonthBookings, practicumSchedules] = await Promise.all([
        getBookingRequests(),
        getAllRooms(),
        getMonthBookings(currentMonth, currentYear),
        getMonthBookings((currentMonth + 1) % 12, currentMonth + 1 > 11 ? currentYear + 1 : currentYear),
        getMonthBookings((currentMonth + 2) % 12, currentMonth + 2 > 11 ? currentYear + 1 : currentYear),
        getScheduledPracticumsForCalendar(),
    ]);

    const calendarBookings = [
        ...currentMonthBookings,
        ...nextMonthBookings,
        ...nextNextMonthBookings
    ];

    const pendingBookings = bookings.filter(b => b.status === 'Pending');

    // --- Data Fetching for Users ---
    const pendingUsers = await getPendingUsers();
    const rejectedUsers = await getRejectedUsers();

    // --- Data Fetching for Returns ---
    const pendingReturns = await getPendingReturns();

    // --- Data Fetching for Manual Input (Items, Lecturers) ---
    const [availableItems, lecturers] = await Promise.all([
        getAvailableItems(),
        getLecturersForLoan()
    ]);


    // --- Loans Content (Pending + Active) ---
    const activeLoans = loans.filter(l => l.status === 'Pending' || l.status === 'Disetujui');

    const loansContent = (
        <div>
            {/* Stats & Actions */}
            <div className="flex flex-col md:flex-row gap-6 mb-8 justify-between items-start md:items-center">
                <div className="flex flex-wrap gap-4 sm:gap-6">
                    <div className="bg-white px-4 sm:px-6 py-4 rounded-xl shadow-sm border border-gray-100 flex-1 min-w-[7rem]">
                        <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-orange-500 mt-1">{pendingLoans.length}</p>
                    </div>
                    <div className="bg-white px-4 sm:px-6 py-4 rounded-xl shadow-sm border border-gray-100 flex-1 min-w-[7rem]">
                        <h3 className="text-gray-500 text-sm font-medium">Aktif</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">
                            {loans.filter(l => l.status === 'Disetujui').length}
                        </p>
                    </div>
                    <div className="bg-white px-4 sm:px-6 py-4 rounded-xl shadow-sm border border-gray-100 flex-1 min-w-[7rem]">
                        <h3 className="text-gray-500 text-sm font-medium">Ditolak</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-1">
                            {loans.filter(l => l.status === 'Ditolak').length}
                        </p>
                    </div>
                </div>
                <div>
                    <ManualLoanButton
                        items={availableItems}
                        lecturers={lecturers}
                        adminId={session!.user.identifier}
                    />
                </div>
            </div>

            {/* Loans Table */}
            <ActiveLoansTable
                loans={activeLoans as any}
                sessionUserId={session!.user.identifier}
            />

            {/* Section 2: Pengembalian Barang */}
            < div className="mt-8" >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    📦 Pengembalian Barang
                    <span className="ml-2 text-sm font-normal text-gray-500">
                        ({pendingReturns.length} menunggu validasi)
                    </span>
                </h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Mahasiswa</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Alat</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Tanggal Pinjam</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Request Return</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pendingReturns.map((loan) => (
                                    <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{loan.student.fullName}</p>
                                                    <p className="text-xs text-gray-500">{loan.student.identifier}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Box className="w-4 h-4 text-primary" />
                                                <p className="font-medium text-gray-900">{loan.item.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm" suppressHydrationWarning>
                                            {loan.requestDate ? new Date(loan.requestDate).toLocaleDateString('id-ID') : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-orange-50 text-orange-700">
                                                Pending Return
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 justify-center">
                                                <form action={async () => {
                                                    'use server';
                                                    await approveReturn(loan.id, session!.user.identifier);
                                                }}>
                                                    <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors" title="Approve Return">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Approve
                                                    </button>
                                                </form>
                                                <form action={async () => {
                                                    'use server';
                                                    await rejectReturn(loan.id);
                                                }}>
                                                    <button className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors" title="Reject Return">
                                                        <XCircle className="w-4 h-4" />
                                                        Reject
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {pendingReturns.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            Tidak ada permintaan pengembalian yang menunggu validasi.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div >
        </div >
    );

    // --- Rooms/Bookings Content (Pending + Active) ---
    const activeBookings = bookings.filter(b => b.status === 'Pending' || b.status === 'Disetujui');

    const roomsContent = (
        <div>
            {/* Stats & Actions */}
            <div className="flex flex-col md:flex-row gap-6 mb-8 justify-between items-start md:items-center">
                <div className="flex flex-wrap gap-4 sm:gap-6">
                    <div className="bg-white px-4 sm:px-6 py-4 rounded-xl shadow-sm border border-gray-100 flex-1 min-w-[7rem]">
                        <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-orange-500 mt-1">{pendingBookings.length}</p>
                    </div>
                    <div className="bg-white px-4 sm:px-6 py-4 rounded-xl shadow-sm border border-gray-100 flex-1 min-w-[7rem]">
                        <h3 className="text-gray-500 text-sm font-medium">Disetujui</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">
                            {bookings.filter(b => b.status === 'Disetujui').length}
                        </p>
                    </div>
                    <div className="bg-white px-4 sm:px-6 py-4 rounded-xl shadow-sm border border-gray-100 flex-1 min-w-[7rem]">
                        <h3 className="text-gray-500 text-sm font-medium">Ditolak</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-1">
                            {bookings.filter(b => b.status === 'Ditolak').length}
                        </p>
                    </div>
                </div>
                <div>
                    <ManualBookingButton
                        rooms={rooms}
                        lecturers={lecturers}
                        adminId={session!.user.identifier}
                    />
                </div>
            </div>

            <CalendarView
                rooms={rooms}
                bookings={calendarBookings}
                practicumSchedules={practicumSchedules}
                title="Kalender Jadwal Ruangan"
                className="mb-8"
            />

            {/* Bookings Table */}
            <ActiveBookingsTable
                bookings={activeBookings as any}
                sessionUserId={session!.user.identifier}
            />
        </div >
    );

    // --- Riwayat Content (Completed + Rejected) ---
    const completedLoans = loans.filter(l => l.returnStatus === 'Dikembalikan' || l.status === 'Ditolak');
    const completedBookings = bookings.filter(b => (b.status as string) === 'Selesai' || b.status === 'Ditolak');

    const riwayatContent = (
        <SearchableRiwayatSection
            completedLoans={completedLoans as any}
            completedBookings={completedBookings as any}
        />
    );

    // --- Data Fetching for History (OLD - TO REMOVE) ---
    const startDate = params?.startDate ? new Date(params.startDate as string) : undefined;
    const endDate = params?.endDate ? new Date(params.endDate as string) : undefined;

    // Fetch both loan and booking history
    const [historyLoans, historyBookings] = await Promise.all([
        getLoanRequests(undefined, startDate, endDate),
        getBookingRequests(undefined, startDate, endDate)
    ]);

    // --- History Content ---
    const historyContent = (
        <div className="space-y-8">
            <LoanHistoryFilter />

            {/* Loan History */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Peminjaman Alat ({historyLoans.length})</h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Mahasiswa</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Alat</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Tanggal Pinjam</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Rencana Kembali</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Validator</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {historyLoans.map((loan) => (
                                    <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{loan.student.fullName}</p>
                                                    <p className="text-xs text-gray-500">{loan.student.identifier}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Box className="w-4 h-4 text-primary" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{loan.item.name}</p>
                                                    <p className="text-xs text-gray-500">{loan.item.category.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {new Date(loan.requestDate!).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {new Date(loan.returnPlanDate).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${loan.status === 'Pending' ? 'bg-yellow-50 text-yellow-700' :
                                                loan.status === 'Disetujui' ? 'bg-green-50 text-green-700' :
                                                    loan.status === 'Ditolak' ? 'bg-red-50 text-red-700' :
                                                        loan.status === 'Selesai' ? 'bg-blue-50 text-blue-700' :
                                                            'bg-gray-50 text-gray-700'
                                                }`}>
                                                {loan.status}
                                            </span>
                                            {loan.status === 'Ditolak' && (loan as any).rejectionReason && (
                                                <div className="mt-1.5 flex items-start gap-1.5 text-xs text-red-600 bg-red-50 rounded-lg px-2.5 py-1.5 max-w-xs">
                                                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                                    <span>{(loan as any).rejectionReason}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {loan.validatorId ? 'Admin' : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <form action={async () => {
                                                'use server';
                                                await deleteLoan(loan.id);
                                            }}>
                                                <button
                                                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus Riwayat"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                                {historyLoans.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            Tidak ada riwayat peminjaman.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Booking History */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Booking Ruangan ({historyBookings.length})</h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Pemohon</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Ruangan</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Waktu</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Validator</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {historyBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{booking.user.fullName}</p>
                                                    <p className="text-xs text-gray-500">{booking.user.identifier}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{booking.room.name}</td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            <div>{new Date(booking.startTime).toLocaleDateString('id-ID')}</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(booking.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} -
                                                {new Date(booking.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${booking.status === 'Pending' ? 'bg-yellow-50 text-yellow-700' :
                                                booking.status === 'Disetujui' ? 'bg-green-50 text-green-700' :
                                                    booking.status === 'Ditolak' ? 'bg-red-50 text-red-700' :
                                                        'bg-gray-50 text-gray-700'
                                                }`}>
                                                {booking.status}
                                            </span>
                                            {booking.status === 'Ditolak' && (booking as any).rejectionReason && (
                                                <div className="mt-1.5 flex items-start gap-1.5 text-xs text-red-600 bg-red-50 rounded-lg px-2.5 py-1.5 max-w-xs">
                                                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                                    <span>{(booking as any).rejectionReason}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {booking.validatorId ? 'Admin' : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <form action={async () => {
                                                'use server';
                                                await deleteBooking(booking.id);
                                            }}>
                                                <button
                                                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus Riwayat"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                                {historyBookings.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            Tidak ada riwayat booking.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    // --- Users Content ---
    const usersContent = (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Menunggu Persetujuan</h3>
                    <p className="text-3xl font-bold text-orange-500 mt-2">{pendingUsers.length}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Nama Lengkap</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">NIM</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Email</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Tanggal Daftar</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pendingUsers.map((user) => (
                                <tr key={user.identifier} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.fullName}</td>
                                    <td className="px-6 py-4 text-gray-600">{user.identifier}</td>
                                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                        {new Date(user.createdAt!).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 justify-center">
                                            <form action={async () => {
                                                'use server';
                                                await updateUserStatus(user.identifier, 'Active');
                                            }}>
                                                <button className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-colors" title="Setujui">
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                            </form>
                                            <form action={async () => {
                                                'use server';
                                                await updateUserStatus(user.identifier, 'Rejected');
                                            }}>
                                                <button className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Tolak">
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {pendingUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Tidak ada permintaan akun baru.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Rejected Users History */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Riwayat Pendaftaran Ditolak
                    <span className="ml-2 text-sm font-normal text-gray-500">
                        ({rejectedUsers.length})
                    </span>
                </h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto hidden md:block">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Nama Lengkap</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">NIM/NIDN</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Email</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Role</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Tanggal Daftar</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rejectedUsers.map((user) => (
                                    <tr key={user.identifier} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{user.fullName}</td>
                                        <td className="px-6 py-4 text-gray-600">{user.identifier}</td>
                                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">{user.role}</td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {new Date(user.createdAt!).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700">
                                                Ditolak
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {rejectedUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            Tidak ada riwayat pendaftaran yang ditolak.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 block md:hidden">
                        {rejectedUsers.map((user) => (
                            <div key={user.identifier} className="bg-white border rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 break-words">{user.fullName}</p>
                                            <p className="text-xs text-gray-500">{user.identifier}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 space-y-1 mt-auto">
                                    <p className="text-xs text-red-700 font-medium">{user.role}</p>
                                    <p className="text-xs text-gray-600 break-words">{user.email || 'Tidak ada email'}</p>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                    <span className="text-xs text-gray-500">{new Date(user.createdAt!).toLocaleDateString('id-ID')}</span>
                                    <span className="inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
                                        Ditolak
                                    </span>
                                </div>
                            </div>
                        ))}
                        {rejectedUsers.length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-500 border rounded-xl border-dashed">
                                Tidak ada riwayat pendaftaran yang ditolak.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manajemen Layanan</h1>
                <p className="text-gray-500 text-sm mt-1">Kelola permintaan dan input manual untuk peminjaman alat dan ruangan</p>
            </div>

            <ValidationTabs
                loansContent={loansContent}
                roomsContent={roomsContent}
                riwayatContent={riwayatContent}
                usersContent={usersContent}
            />
        </div>
    );
}
