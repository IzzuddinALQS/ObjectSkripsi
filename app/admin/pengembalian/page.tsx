import { getLoanRequests, getPendingReturns } from '@/features/loans/actions';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Box, User, Calendar, CheckCircle } from 'lucide-react';
import PendingReturnsList from '../validations/_components/PendingReturnsList';

export default async function PengembalianPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    // Get all approved loans (active loans that need to be returned)
    const loans = await getLoanRequests();
    const activeLoans = loans.filter(l => l.status === 'Disetujui');

    // Get pending returns (loans waiting for return approval)
    const pendingReturns = await getPendingReturns();

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Pengembalian Alat</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Peminjaman Aktif</h3>
                    <p className="text-4xl font-bold text-green-600 mt-2">{activeLoans.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Perlu dikembalikan</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Pending Return</h3>
                    <p className="text-4xl font-bold text-orange-500 mt-2">{pendingReturns.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Menunggu validasi pengembalian</p>
                </div>
            </div>

            {/* Pending Returns List */}
            {pendingReturns.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Pengembalian</h2>
                    <PendingReturnsList returns={pendingReturns} validatorId={session.userId} />
                </div>
            )}

            {/* Active Loans Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Peminjaman Aktif</h2>
                    <p className="text-sm text-gray-500 mt-1">Daftar alat yang sedang dipinjam dan perlu dikembalikan</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Mahasiswa</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Alat</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Tanggal Pinjam</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Rencana Kembali</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Durasi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {activeLoans.map((loan) => {
                                const borrowedDate = loan.requestDate ? new Date(loan.requestDate) : new Date();
                                const returnDate = loan.returnPlanDate ? new Date(loan.returnPlanDate) : null;
                                const today = new Date();
                                const isOverdue = returnDate && returnDate < today;
                                const daysActive = Math.floor((today.getTime() - borrowedDate.getTime()) / (1000 * 60 * 60 * 24));

                                return (
                                    <tr key={loan.id} className={`hover:bg-gray-50 transition-colors ${isOverdue ? 'bg-red-50' : ''}`}>
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
                                                <Box className="w-4 h-4 text-gray-400" />
                                                <p className="text-gray-900">{loan.item.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600" suppressHydrationWarning>
                                            {borrowedDate.toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4" suppressHydrationWarning>
                                            {returnDate ? (
                                                <div className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                                                    {returnDate.toLocaleDateString('id-ID')}
                                                    {isOverdue && (
                                                        <span className="block text-xs">Terlambat!</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                                {daysActive} hari
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {activeLoans.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <CheckCircle className="w-12 h-12 text-gray-300" />
                                            <p>Tidak ada peminjaman aktif</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
